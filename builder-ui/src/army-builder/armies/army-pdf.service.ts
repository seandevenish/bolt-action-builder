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
  private readonly textXsSize = 12 * 0.75;

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
    simulatedYPosition = this.writeUnits(units, pdf, simulatedYPosition, this.leftMargin + this.panelPadding, panelWidth, true);
    //simulatedYPosition = simulatedYPosition + this.panelPadding;
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

    // yPosition += this.panelPadding; // Add bottom padding of panel

    return yPosition;
  }

  private async writePlatoonTitle(platoon: Platoon, pdf: jsPDF, yPosition: number, simulate: boolean) {
    yPosition += this.panelPadding;
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(this.textMdSize);
    this.textGray500(pdf);
    pdf.text(`${platoon.name}`, this.leftMargin + this.panelPadding, yPosition);

    pdf.setFontSize(this.textSmSize);
    this.textGray700(pdf);
    const cost = await firstValueFrom(platoon.cost$);
    const platoonCostText = `${cost.toLocaleString()} Pts`;
    const textWidth = pdf.getTextWidth(platoonCostText);

    if (!simulate) pdf.text(platoonCostText, this.pageWidth - this.leftMargin - this.panelPadding - textWidth, yPosition);

    return yPosition + this.textMdlineHeight;
  }

  private writeUnits(units: Unit[], pdf: jsPDF, yPosition: number, xStart: number, panelWidth: number, simulate: boolean): number {

    this.drawDebugLine(pdf, 'blue', this.leftMargin + this.panelPadding, yPosition, 5);

    const columnWidth = (panelWidth - 2 * this.panelPadding) / 2; // Divide space into two columns
    let maxRowHeight = 0; // Track the tallest unit in the current row

    units.forEach((unit, index) => {
      const column = index % 2; // Determine which column
      const xPosition = xStart + column * columnWidth;

      // Determine the vertical position for the current row
      if (column === 0 && index !== 0) {
        yPosition += maxRowHeight + 3; // Move to the next row, adding spacing between rows (Row Spacer)
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
    this.drawDebugLine(pdf, 'green', this.leftMargin + this.panelPadding, yPosition, 10);
    this.drawDebugLine(pdf, 'yellow', this.leftMargin + this.panelPadding, yPosition + maxRowHeight, 15);
    return yPosition + maxRowHeight;
  }

  private writeUnit(unit: Unit, pdf: jsPDF, xPosition: number, yPosition: number, columnWidth: number, simulate: boolean): number {
    const startingYPosition = yPosition;
    const unitText = `${unit.title}`;
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(this.textSmSize);
    const wrappedText = pdf.splitTextToSize(unitText, columnWidth - 5);

    if (!simulate) {
      pdf.setFontSize(this.textSmSize);
      wrappedText.forEach((line: string | string[], lineIndex: number) => {
        pdf.text(line, xPosition, yPosition + lineIndex * this.textSmlineHeight);
      });
    }

    yPosition += wrappedText.length * this.textSmlineHeight;

    pdf.setFont('Helvetica', 'normal');

    // Cost, Count and Experience
    const costString = `${unit.cost} Pts`;
    const countString = `${unit.countString}`;
    const experienceText = `${unit.experience}`;

    if (!simulate) {
      let stringXPosition = xPosition;

      // Cost String
      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(this.textXsSize);
      this.textGray500(pdf);
      pdf.text(costString, stringXPosition, yPosition);
      stringXPosition += pdf.getTextWidth(costString) + 3;

      // Count String (eg. '6 men')
      pdf.setFont('Helvetica', 'normal');
      pdf.setFontSize(this.textSmSize);
      this.textGray700(pdf);
      pdf.text(countString, stringXPosition, yPosition);
      if (countString != '') stringXPosition += pdf.getTextWidth(countString) + 2;

      // Experience
      // Experience Bounding Rectangle
      this.bgGray100(pdf);
      pdf.roundedRect(stringXPosition, yPosition - this.textSmlineHeight + 2 - 0.8, pdf.getTextWidth(experienceText) + 4 + 0.2, this.textSmlineHeight + 0.5, 1, 1, 'F');
      this.textGray700(pdf);
      // Experience Text
      pdf.text(experienceText, stringXPosition + 2, yPosition);
    }

    yPosition += this.textSmlineHeight + 1;

    // Vehicle details
    const vehicleUnitSelector = (unit.selector instanceof VehicleUnitSelector) ? unit.selector as VehicleUnitSelector : null;
    if (vehicleUnitSelector) {
      const vehicleDetails = `${vehicleUnitSelector.damageValue}+ Damage`;
      if (!simulate) {
        pdf.setFontSize(this.textSmSize);
        pdf.text(vehicleDetails, xPosition, yPosition);
      }
      yPosition += this.textSmlineHeight;

      if (vehicleUnitSelector.transportCapacity) {
        const transportDetails = `Transports ${vehicleUnitSelector.transportCapacity}`;
        if (!simulate) {
          pdf.setFontSize(this.textSmSize);
          pdf.text(transportDetails, xPosition, yPosition);
        }
        yPosition += this.textSmlineHeight;
      }

      if (vehicleUnitSelector.tow) {
        const towDetails = `Tows ${vehicleUnitSelector.tow}`;
        if (!simulate) {
          pdf.setFontSize(this.textSmSize);
          pdf.text(towDetails, xPosition, yPosition);
        }
        yPosition += this.textSmlineHeight;
      }
    }

    // Weapon Summary
    const weaponSummaryText = unit.weaponSummary.map(w => `${w.qty} ${w.role ? w.role + ' with ' : ''}${w.description}`).join(', ');
    if (weaponSummaryText?.length) {
      const wrappedWeaponSummaryText = pdf.splitTextToSize(weaponSummaryText, columnWidth - 5);

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
      const wrappedRulesText = pdf.splitTextToSize(specialRulesText, columnWidth - 5);

      if (!simulate) {
        pdf.setFontSize(this.textSmSize);
        wrappedRulesText.forEach((line: string | string[], lineIndex: number) => {
          pdf.text(line, xPosition, yPosition + lineIndex * this.textSmlineHeight);
        });
      }

      yPosition += wrappedRulesText.length * this.textSmlineHeight;
    }

    // todo: insert a yellow dash right here
    this.drawDebugLine(pdf, 'red', xPosition, yPosition, 10);

    return yPosition - startingYPosition;
  }

  private drawDebugLine(pdf: jsPDF, color: 'red' | 'yellow' | 'blue' | 'green', xPosition: number, yPosition: number, length: number = 0) {
    return;
    switch(color) {
      case 'red':
        pdf.setDrawColor(255, 0, 0); // Red color
        break;
      case 'yellow':
        pdf.setDrawColor(255, 204, 0); // Yellow color
        break;
      case 'blue':
        pdf.setDrawColor(0, 204, 255); // Blue color
        break;
      case 'green':
        pdf.setDrawColor(0, 255, 0); // Green color
        break;
    }
    pdf.setLineWidth(0.5); // Set line width
    pdf.line(xPosition, yPosition, xPosition + length, yPosition); // Draw the dash
    //pdf.text(yPosition.toFixed(1).toString(), xPosition + length + 2, yPosition);
  }
}
