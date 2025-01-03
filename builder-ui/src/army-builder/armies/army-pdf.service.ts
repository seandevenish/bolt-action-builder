import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { Force } from '../forces/force.class';
import { firstValueFrom } from 'rxjs';
import { Platoon } from '../platoons/platoon.class';
import { Unit } from '../units/unit.class';
import { VehicleUnitSelector } from '../units/vehicle-unit-selector.class';

@Injectable({
  providedIn: 'root',
})
export class ArmyPdfService {
  private readonly leftMargin = 12;
  private readonly topMargin = 15;
  private readonly pageWidth = 210; // A4 width in mm
  private readonly pageHeight = 297; // A4 height in mm

  private readonly textGray700 = (pdf: jsPDF) => pdf.setTextColor(51, 65, 85);
  private readonly textGray500 = (pdf: jsPDF) => pdf.setTextColor(100, 116, 139);

  private readonly bgGray100 = (pdf: jsPDF) => pdf.setFillColor(226, 232, 240);
  private readonly borderGray100 = (pdf: jsPDF) => pdf.setDrawColor(226, 232, 240);

  private readonly textLgSize = 18 * 0.75;
  private readonly textLglineHeight = 24 * 0.264583;
  private readonly textMdSize = 16 * 0.75;
  private readonly textMdlineHeight = 24 * 0.264583;
  private readonly textSmSize = 14 * 0.75;
  private readonly textSmlineHeight = 20 * 0.264583;


  private readonly panelPadding = 12 * 0.264583;
  private readonly panelRadius = 12 * 0.264583;

  async generateArmySummaryPDF(force: Force, fileName: string) {
    const pdf = new jsPDF('p', 'mm', 'a4'); // A4 portrait orientation
    let yPosition = this.topMargin; // Starting vertical position

    // Title
    const pointsText = `${force.cost.toLocaleString()} Pts`;

    pdf.setFontSize(this.textLgSize);
    pdf.setFont('Helvetica', 'bold');
    const maxTitleWidth = this.pageWidth - 2 * this.leftMargin - pdf.getTextWidth(pointsText); // Account for points width
    const wrappedTitle = pdf.splitTextToSize(force.army.name, maxTitleWidth);
    wrappedTitle.forEach((line: string, index: number) => {
      pdf.text(line, this.leftMargin, yPosition + index * this.textLglineHeight);
    });

    // Right-aligned points total
    pdf.setFontSize(this.textMdSize);

    this.textGray700(pdf);
    const textWidth = pdf.getTextWidth(pointsText);
    pdf.text(pointsText, this.pageWidth - this.leftMargin - textWidth, yPosition);

    yPosition += wrappedTitle.length * this.textLglineHeight; // Move below the title with spacing

    // Description
    pdf.setFont('Helvetica', 'normal');
    if (force.army.description) {
      pdf.setFontSize(this.textSmSize);
      this.textGray500(pdf);
      const description = pdf.splitTextToSize(force.army.description, this.pageWidth - 2 * this.leftMargin);
      pdf.text(description, this.leftMargin, yPosition);
      yPosition += description.length * this.textSmlineHeight; // Adjust for wrapped text height
    }

    // Fetch platoons using platoons$ observable
    const platoons = await firstValueFrom(force.platoons$);
    for (const platoon of platoons) {
      yPosition += 6  * 0.264583;
      yPosition = await this.writePlatoon(platoon, pdf, yPosition);
    }

    // Save the PDF and trigger download
    pdf.save(fileName);
  }

  private async writePlatoon(platoon: Platoon, pdf: jsPDF, yPosition: number): Promise<number> {
    const panelStartY = yPosition;
    yPosition += this.panelPadding;
    const panelWidth = this.pageWidth - 2 * this.leftMargin;

    // Fetch units
    const units = await firstValueFrom(platoon.units$);

    // Calculate panel height dynamically based on unit content
    let simulatedYPosition = yPosition;
    simulatedYPosition = await this.writePlatoonTitle(platoon, pdf, simulatedYPosition, true);
    simulatedYPosition = this.writeUnits(units, pdf, simulatedYPosition, this.leftMargin + this.panelPadding, panelWidth, true) + this.panelPadding;
    const panelHeight = simulatedYPosition - panelStartY;

    // Handle page break
    if (yPosition + panelHeight > this.pageHeight - this.topMargin) {
      pdf.addPage();
      yPosition = this.topMargin;
    }

    // Draw panel outline with no fill
    this.borderGray100(pdf);
    pdf.setLineWidth(0.1); // Set line width to thin
    pdf.roundedRect(this.leftMargin, panelStartY, panelWidth, panelHeight, this.panelRadius, this.panelRadius, 'S'); // 'S' for stroke only

    // Add platoon title and cost
    yPosition = await this.writePlatoonTitle(platoon, pdf, yPosition, false);

    // Render units in two columns
    yPosition = this.writeUnits(units, pdf, yPosition, this.leftMargin + this.panelPadding, panelWidth, false);

    yPosition += this.panelPadding; // Add bottom padding of panel

    return yPosition;
  }

  private async writePlatoonTitle(platoon: Platoon, pdf: jsPDF, yPosition: number, simulate: boolean) {
    yPosition += this.panelPadding;
    pdf.setFontSize(this.textMdSize);
    pdf.text(`${platoon.name}`, this.leftMargin + this.panelPadding, yPosition);

    pdf.setFontSize(this.textSmSize);
    const cost = await firstValueFrom(platoon.cost$);
    const platoonCostText = `${cost.toLocaleString()} Pts`;
    const textWidth = pdf.getTextWidth(platoonCostText);
    pdf.text(platoonCostText, this.pageWidth - this.leftMargin - this.panelPadding - textWidth, yPosition);

    return yPosition + this.textMdlineHeight;
  }

  private writeUnits(units: Unit[], pdf: jsPDF, yPosition: number, xStart: number, panelWidth: number, simulate: boolean): number {
    const columnWidth = (panelWidth - 2 * this.panelPadding) / 2; // Divide space into two columns
    let maxRowHeight = 0; // Track the tallest unit in the current row

    units.forEach((unit, index) => {
      const column = index % 2; // Determine which column
      const xPosition = xStart + column * columnWidth;

      // Determine the vertical position for the current row
      if (column === 0 && index !== 0) {
        yPosition += maxRowHeight + 5; // Move to the next row, adding spacing
        maxRowHeight = 0; // Reset row height for the next row
      }

      // Calculate the height of the unit's content
      // Handle simulation mode to calculate unit height
      const unitHeight = this.writeUnit(unit, pdf, xPosition, yPosition, columnWidth, true);

      // Update max row height
      maxRowHeight = Math.max(maxRowHeight, unitHeight);

      // Handle page break if necessary
      if (!simulate && yPosition + unitHeight > this.pageHeight - this.topMargin) {
        pdf.addPage();
        yPosition = this.topMargin;
        maxRowHeight = unitHeight; // Reset max row height for the new page
      }

      // Write the unit details if not simulating
      if (!simulate) {
        this.writeUnit(unit, pdf, xPosition, yPosition, columnWidth, false);
      }
    });

    // Add the height of the last row to the final yPosition
    return yPosition + maxRowHeight;
  }

  private writeUnit(unit: Unit, pdf: jsPDF, xPosition: number, yPosition: number, columnWidth: number, simulate: boolean): number {
    const unitText = `${unit.selector.name} (${unit.countString})`;
    const wrappedText = pdf.splitTextToSize(unitText, columnWidth);
    let unitHeight = wrappedText.length * this.textSmlineHeight;

    if (!simulate) {
      pdf.setFontSize(this.textSmSize);
      wrappedText.forEach((line: string | string[], lineIndex: number) => {
        pdf.text(line, xPosition, yPosition + lineIndex * this.textSmlineHeight);
      });
    }

    yPosition += unitHeight;
    unitHeight += this.textSmlineHeight; // Add spacing after unit name

    // Experience
    const experienceText = `${unit.experience}`;
    if (!simulate) {
      pdf.setFontSize(this.textSmSize);
      pdf.text(experienceText, xPosition, yPosition);
    }
    yPosition += this.textSmlineHeight;
    unitHeight += this.textSmlineHeight;

    // Vehicle details
    const vehicleUnitSelector = (unit.selector instanceof VehicleUnitSelector) ? unit.selector as VehicleUnitSelector : null;
    if (vehicleUnitSelector) {
      const vehicleDetails = `${vehicleUnitSelector.damageValue}+ Damage`;
      if (!simulate) {
        pdf.setFontSize(this.textSmSize);
        pdf.text(vehicleDetails, xPosition, yPosition);
      }
      yPosition += this.textSmlineHeight;
      unitHeight += this.textSmlineHeight;

      if (vehicleUnitSelector.transportCapacity) {
        const transportDetails = `Transports ${vehicleUnitSelector.transportCapacity}`;
        if (!simulate) {
          pdf.setFontSize(this.textSmSize);
          pdf.text(transportDetails, xPosition, yPosition);
        }
        yPosition += this.textSmlineHeight;
        unitHeight += this.textSmlineHeight;
      }

      if (vehicleUnitSelector.tow) {
        const towDetails = `Tows ${vehicleUnitSelector.tow}`;
        if (!simulate) {
          pdf.setFontSize(this.textSmSize);
          pdf.text(towDetails, xPosition, yPosition);
        }
        yPosition += this.textSmlineHeight;
        unitHeight += this.textSmlineHeight;
      }
    }

    // Weapon Summary
    const weaponSummaryText = unit.weaponSummary.map(w => `${w.qty} ${w.role ? w.role + ' with ' : ''}${w.description}`).join(', ');
    if (weaponSummaryText?.length) {
      const wrappedWeaponSummaryText = pdf.splitTextToSize(weaponSummaryText, columnWidth);
      unitHeight += wrappedWeaponSummaryText.length * this.textSmlineHeight;
  
      if (!simulate) {
        pdf.setFontSize(this.textSmSize);
        wrappedWeaponSummaryText.forEach((line: string | string[], lineIndex: number) => {
        pdf.text(line, xPosition, yPosition + lineIndex * this.textSmlineHeight);
        });
      }
  
      yPosition += wrappedWeaponSummaryText.length * this.textSmlineHeight;
    }
    
    // Special rules
    const specialRulesText = unit.specialRules.map(rule => rule.name).join(', ');
    if (specialRulesText?.length) {
      const wrappedRulesText = pdf.splitTextToSize(specialRulesText, columnWidth);
      unitHeight += wrappedRulesText.length * this.textSmlineHeight;
  
      if (!simulate) {
        pdf.setFontSize(this.textSmSize);
        wrappedRulesText.forEach((line: string | string[], lineIndex: number) => {
          pdf.text(line, xPosition, yPosition + lineIndex * this.textSmlineHeight);
        });
      }
  
      yPosition += wrappedRulesText.length * this.textSmlineHeight;
    }

    return unitHeight;
  }
}
