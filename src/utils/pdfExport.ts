import { Project } from '../types/project';
import { formatCurrency } from './formatCurrency';
import { scopeOfWorkData } from '../data/scopeOfWork';
import { helpText } from '../data/helpText';

// Map technical group names to friendly category names with conversational intros
const categoryInfo: Record<string, { friendlyName: string; intro: string }> = {
  'GCs': { 
    friendlyName: 'Project Setup & Management', 
    intro: 'We\'ve included the planning and administrative items needed to get your project off the ground:' 
  },
  'Demo': { 
    friendlyName: 'Demolition & Site Preparation', 
    intro: 'This covers removing existing elements and preparing the space for new construction:' 
  },
  'Structural': { 
    friendlyName: 'Structural Work', 
    intro: 'Structural elements and supports included in your project:' 
  },
  'Concrete': { 
    friendlyName: 'Concrete Work', 
    intro: 'Concrete work for your project includes:' 
  },
  'Wood / Carpentry': { 
    friendlyName: 'Carpentry & Millwork', 
    intro: 'Custom carpentry and finish work to complete your space:' 
  },
  'Thermal / Moisture': { 
    friendlyName: 'Weatherproofing & Insulation', 
    intro: 'Protecting your building from the elements:' 
  },
  'Doors and Windows': { 
    friendlyName: 'Doors & Windows', 
    intro: 'Entry points, interior doors, and glazing for your space:' 
  },
  'Finishes': { 
    friendlyName: 'Interior Finishes', 
    intro: 'The visible finishes that will define the look and feel of your space:' 
  },
  'Specialties': { 
    friendlyName: 'Specialty Items', 
    intro: 'Specialty fixtures and accessories included:' 
  },
  'Fire Sprinklers': { 
    friendlyName: 'Fire Protection', 
    intro: 'Fire safety systems for your project:' 
  },
  'Plumbing': { 
    friendlyName: 'Plumbing', 
    intro: 'Plumbing fixtures and rough-in work:' 
  },
  'Mechanical': { 
    friendlyName: 'HVAC & Mechanical', 
    intro: 'Heating, cooling, and ventilation systems:' 
  },
  'Electrical': { 
    friendlyName: 'Electrical & Lighting', 
    intro: 'Power distribution and lighting for your space:' 
  },
};

// Generate the Budget Summary section
const generateBudgetSummary = (project: Project): string => {
  // Group line items by category
  const itemsByCategory: Record<string, typeof project.lineItems> = {};
  
  project.lineItems.forEach(item => {
    // Find the group for this scope item
    const scopeData = scopeOfWorkData.find(s => s.name === item.scopeName);
    const group = scopeData?.group || 'Other';
    
    // Only include items with quantity > 0 OR custom items (even with qty 0)
    if (item.quantity > 0 || item.isCustom) {
      if (!itemsByCategory[group]) {
        itemsByCategory[group] = [];
      }
      itemsByCategory[group].push(item);
    }
  });

  let summaryHtml = `
  <div style="margin-bottom: 30px; margin-top: 30px;">
    <h2 style="color: #1B2D4F; margin-bottom: 20px;">${project.projectName} Budget Summary</h2>
    
    <div style="margin-bottom: 25px; padding: 15px; background-color: #f5f5f5; border-left: 4px solid #1B2D4F;">
      <h3 style="margin-top: 0; color: #1B2D4F; font-size: 12pt;">Project Overview</h3>
      <p style="margin: 8px 0;"><strong>Project:</strong> ${project.projectName}</p>
      <p style="margin: 8px 0;"><strong>Location:</strong> ${project.address}</p>
      <p style="margin: 8px 0;"><strong>Budget Date:</strong> ${new Date().toLocaleDateString()}</p>
      <p style="margin: 12px 0 0 0; font-size: 10pt; line-height: 1.5;">
        This preliminary budget is based on typical unit costs for commercial construction, 
        user-provided quantities and selections, and industry-standard assumptions. 
        No architectural drawings or engineering have been completed at this stage.
      </p>
    </div>

    <h3 style="color: #1B2D4F; margin-top: 25px; margin-bottom: 15px;">Scope Included in This Budget</h3>
  `;

  // Generate category sections in the order they appear in scopeOfWorkData
  const orderedCategories: string[] = [];
  scopeOfWorkData.forEach(item => {
    if (!orderedCategories.includes(item.group)) {
      orderedCategories.push(item.group);
    }
  });

  orderedCategories.forEach(group => {
    if (!itemsByCategory[group]) return;

    const categoryData = categoryInfo[group] || { 
      friendlyName: group, 
      intro: `${group} work included in your project:` 
    };

    summaryHtml += `
    <div style="margin-bottom: 20px;">
      <h4 style="color: #F7931E; margin-bottom: 8px; font-size: 11pt; text-transform: uppercase;">${categoryData.friendlyName}</h4>
      <p style="margin: 6px 0 10px 0; font-size: 10pt; color: #555;">${categoryData.intro}</p>
      <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
    `;

    itemsByCategory[group].forEach(item => {
      const displayName = item.isCustom && item.customScopeName 
        ? item.customScopeName 
        : item.scopeName;

      summaryHtml += `
        <li style="margin-bottom: 6px; font-size: 10pt;">
          ${displayName}
          ${item.notes ? `<div style="margin-left: 0; margin-top: 3px; font-style: italic; color: #666; font-size: 9pt;">Note: ${item.notes}</div>` : ''}
        </li>
      `;
    });

    summaryHtml += `
      </ul>
    </div>
    `;
  });

  // Add General Conditions & Markup section
  summaryHtml += `
    <h3 style="color: #1B2D4F; margin-top: 30px; margin-bottom: 15px;">General Conditions & Markup</h3>
    <div style="padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd;">
      <p style="margin: 8px 0; font-size: 10pt;">
        <strong>General Conditions (${project.generalConditionsPercentage}%):</strong> 
        Covers supervision, project management, temporary facilities, safety equipment, and job site overhead.
      </p>
  `;

  if ((project.overheadPercentage || 0) > 0 && (project.profitPercentage || 0) > 0) {
    summaryHtml += `
      <p style="margin: 8px 0; font-size: 10pt;">
        <strong>Overhead (${project.overheadPercentage}%):</strong> Company operational costs and indirect expenses.
      </p>
      <p style="margin: 8px 0; font-size: 10pt;">
        <strong>Profit (${project.profitPercentage}%):</strong> Contractor profit margin.
      </p>
    `;
  } else {
    summaryHtml += `
      <p style="margin: 8px 0; font-size: 10pt;">
        <strong>GC Markup (${project.gcMarkupPercentage}%):</strong> 
        Covers insurance, bonding capacity, profit, and business risk.
      </p>
    `;
  }

  if ((project.bondInsurancePercentage || 0) > 0) {
    summaryHtml += `
      <p style="margin: 8px 0; font-size: 10pt;">
        <strong>Bond & Insurance (${project.bondInsurancePercentage}%):</strong> 
        Performance bonds and additional insurance requirements.
      </p>
    `;
  }

  if ((project.contingencyPercentage || 0) > 0) {
    summaryHtml += `
      <p style="margin: 8px 0; font-size: 10pt;">
        <strong>Contingency (${project.contingencyPercentage}%):</strong> 
        Reserve for unforeseen conditions or minor changes.
      </p>
    `;
  }

  if ((project.salesTaxPercentage || 0) > 0) {
    summaryHtml += `
      <p style="margin: 8px 0; font-size: 10pt;">
        <strong>Sales Tax (${project.salesTaxPercentage}%):</strong> 
        Applied to taxable materials and equipment.
      </p>
    `;
  }

  summaryHtml += `
    </div>
  `;

  // Add What's Not Included section
  summaryHtml += `
    <h3 style="color: #1B2D4F; margin-top: 30px; margin-bottom: 15px;">What's Not Included in This Budget</h3>
    <div style="padding: 15px; background-color: #fff3cd; border-left: 4px solid #F7931E;">
      <p style="margin: 0 0 10px 0; font-size: 10pt; line-height: 1.6;">
        Unless specifically listed above, this preliminary budget does not include the following items. 
        Please discuss any of these needs with your contractor during the planning phase:
      </p>
      <ul style="margin: 10px 0; padding-left: 20px; list-style-type: disc; column-count: 2; column-gap: 20px;">
  `;

  helpText.notIncluded.forEach(exclusion => {
    summaryHtml += `
        <li style="margin-bottom: 6px; font-size: 9pt; break-inside: avoid;">${exclusion}</li>
    `;
  });

  summaryHtml += `
      </ul>
    </div>
  `;

  // Add Important Notes section
  summaryHtml += `
    <h3 style="color: #1B2D4F; margin-top: 30px; margin-bottom: 15px;">Important Notes</h3>
    <div style="padding: 15px; background-color: #f5f5f5; border: 1px solid #ddd;">
      <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
        <li style="margin-bottom: 8px; font-size: 10pt;">
          This is a preliminary planning budget, not a construction proposal or binding quote.
        </li>
        <li style="margin-bottom: 8px; font-size: 10pt;">
          ${helpText.budgetDisclaimer}
        </li>
        <li style="margin-bottom: 8px; font-size: 10pt;">
          All work assumes compliance with local building codes and standard industry practices.
        </li>
        <li style="margin-bottom: 0; font-size: 10pt;">
          For accurate pricing, always obtain detailed proposals from licensed contractors after your design is complete.
        </li>
      </ul>
    </div>
  </div>
  `;

  return summaryHtml;
};

export const generatePDFContent = (project: Project, showCostBreakdown: boolean = true): string => {
  const currentDate = new Date().toLocaleDateString();
  
  // Calculate totals
  const subtotal = project.lineItems.reduce((sum, item) => sum + item.total, 0);
  const generalConditions = subtotal * (project.generalConditionsPercentage / 100);
  const overhead = (project.overheadPercentage || 0) > 0 
    ? (subtotal + generalConditions) * ((project.overheadPercentage || 0) / 100)
    : 0;
  const profit = (project.profitPercentage || 0) > 0
    ? (subtotal + generalConditions + overhead) * ((project.profitPercentage || 0) / 100)
    : 0;
  const gcMarkup = (subtotal + generalConditions) * (project.gcMarkupPercentage / 100);
  const bondInsurance = (project.bondInsurancePercentage || 0) > 0
    ? (subtotal + generalConditions + overhead + profit + gcMarkup) * ((project.bondInsurancePercentage || 0) / 100)
    : 0;
  const contingency = (project.contingencyPercentage || 0) > 0
    ? (subtotal + generalConditions + overhead + profit + gcMarkup + bondInsurance) * ((project.contingencyPercentage || 0) / 100)
    : 0;
  
  const subtotalBeforeTax = subtotal + generalConditions + overhead + profit + gcMarkup + bondInsurance + contingency;
  const taxableAmount = project.lineItems
    .filter(item => item.taxable)
    .reduce((sum, item) => sum + item.total, 0);
  const salesTax = (project.salesTaxPercentage || 0) > 0
    ? taxableAmount * ((project.salesTaxPercentage || 0) / 100)
    : 0;
  
  const grandTotal = subtotalBeforeTax + salesTax;

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      font-size: 11pt;
    }
    
    /* Page break controls for PDF generation */
    p, li, div, h3, .summary-section, .category-section {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #1B2D4F;
      padding-bottom: 15px;
      margin-bottom: 25px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .logo {
      font-size: 24pt;
      font-weight: bold;
      color: #1B2D4F;
    }
    .logo-accent {
      color: #F7931E;
    }
    .project-info {
      margin-bottom: 25px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .project-info table {
      width: 100%;
      border-collapse: collapse;
    }
    .project-info td {
      padding: 6px 10px;
      border: 1px solid #ddd;
    }
    .project-info td:first-child {
      font-weight: bold;
      width: 150px;
      background-color: #f5f5f5;
    }
    .line-items {
      margin-top: 20px;
    }
    .line-items table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    .line-items th {
      background-color: #1B2D4F;
      color: white;
      padding: 10px;
      text-align: left;
      font-weight: bold;
    }
    .line-items td {
      padding: 8px 10px;
      border-bottom: 1px solid #ddd;
    }
    .line-items tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .line-items tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .text-right {
      text-align: right;
    }
    .totals {
      margin-top: 30px;
      float: right;
      width: 400px;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .totals table {
      width: 100%;
      border-collapse: collapse;
    }
    .totals td {
      padding: 8px 10px;
      border-bottom: 1px solid #ddd;
    }
    .totals td:first-child {
      font-weight: bold;
    }
    .totals td:last-child {
      text-align: right;
    }
    .grand-total {
      background-color: #1B2D4F;
      color: white;
      font-weight: bold;
      font-size: 13pt;
    }
    .footer {
      clear: both;
      margin-top: 50px;
      padding-top: 15px;
      border-top: 2px solid #ddd;
      font-size: 9pt;
      color: #666;
      text-align: center;
    }
    .notes {
      margin-top: 30px;
      padding: 15px;
      background-color: #fff3cd;
      border-left: 4px solid #F7931E;
    }
    .notes-title {
      font-weight: bold;
      margin-bottom: 8px;
      color: #1B2D4F;
    }
    .cost-breakdown {
      font-size: 9pt;
      color: #666;
    }
    @media print {
      body { margin: 0; padding: 15px; }
      .page-break { page-break-before: always; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">BLDR <span class="logo-accent">IQ</span></div>
    <div style="text-align: right;">
      <div style="font-size: 18pt; font-weight: bold; color: #1B2D4F;">BUDGET ESTIMATE</div>
      <div style="margin-top: 5px;">Date: ${currentDate}</div>
    </div>
  </div>

  <div class="project-info">
    <table>
      <tr>
        <td>Project Name</td>
        <td>${project.projectName}</td>
      </tr>
      <tr>
        <td>Address</td>
        <td>${project.address}</td>
      </tr>
      <tr>
        <td>Status</td>
        <td>${project.status}</td>
      </tr>
      <tr>
        <td>Created</td>
        <td>${new Date(project.createdAt).toLocaleDateString()}</td>
      </tr>
      <tr>
        <td>Last Updated</td>
        <td>${new Date(project.updatedAt).toLocaleDateString()}</td>
      </tr>
    </table>
  </div>

  ${project.notes ? `
  <div class="notes">
    <div class="notes-title">Project Notes</div>
    <div>${project.notes.replace(/\n/g, '<br>')}</div>
  </div>
  ` : ''}

  ${generateBudgetSummary(project)}

  <div class="line-items page-break">
    <h2 style="color: #1B2D4F; margin-bottom: 10px;">Detailed Line Item Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th style="width: 5%;">#</th>
          <th style="width: ${showCostBreakdown ? '30%' : '45%'};">Scope of Work</th>
          <th style="width: 10%;">Unit</th>
          <th style="width: 10%;" class="text-right">Qty</th>
          <th style="width: ${showCostBreakdown ? '10%' : '15%'};" class="text-right">Unit Cost</th>
          ${showCostBreakdown ? `
          <th style="width: 8%;" class="text-right">Labor</th>
          <th style="width: 8%;" class="text-right">Material</th>
          <th style="width: 7%;" class="text-right">Equip</th>
          <th style="width: 7%;" class="text-right">Sub</th>
          ` : ''}
          <th style="width: 15%;" class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
`;

  project.lineItems.forEach((item, index) => {
    const displayName = item.isCustom && item.customScopeName 
      ? item.customScopeName 
      : item.scopeName;
    
    const hasCostBreakdown = (item.laborCost || 0) + (item.materialCost || 0) + 
                            (item.equipmentCost || 0) + (item.subcontractorCost || 0) > 0;
    
    html += `
        <tr>
          <td>${index + 1}</td>
          <td>
            ${displayName}
            ${item.notes ? `<div class="cost-breakdown">${item.notes}</div>` : ''}
          </td>
          <td>${item.unitType}</td>
          <td class="text-right">${item.quantity.toLocaleString()}</td>
          <td class="text-right">${formatCurrency(item.unitCost)}</td>
          ${showCostBreakdown ? `
          <td class="text-right cost-breakdown">${hasCostBreakdown ? formatCurrency(item.laborCost || 0) : '-'}</td>
          <td class="text-right cost-breakdown">${hasCostBreakdown ? formatCurrency(item.materialCost || 0) : '-'}</td>
          <td class="text-right cost-breakdown">${hasCostBreakdown ? formatCurrency(item.equipmentCost || 0) : '-'}</td>
          <td class="text-right cost-breakdown">${hasCostBreakdown ? formatCurrency(item.subcontractorCost || 0) : '-'}</td>
          ` : ''}
          <td class="text-right"><strong>${formatCurrency(item.total)}</strong></td>
        </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  </div>

  <div class="totals">
    <table>
      <tr>
        <td>Subtotal</td>
        <td>${formatCurrency(subtotal)}</td>
      </tr>
      <tr>
        <td>General Conditions (${project.generalConditionsPercentage}%)</td>
        <td>${formatCurrency(generalConditions)}</td>
      </tr>
`;

  if ((project.overheadPercentage || 0) > 0) {
    html += `
      <tr>
        <td>Overhead (${project.overheadPercentage}%)</td>
        <td>${formatCurrency(overhead)}</td>
      </tr>
    `;
  }

  if ((project.profitPercentage || 0) > 0) {
    html += `
      <tr>
        <td>Profit (${project.profitPercentage}%)</td>
        <td>${formatCurrency(profit)}</td>
      </tr>
    `;
  } else {
    html += `
      <tr>
        <td>GC Markup (${project.gcMarkupPercentage}%)</td>
        <td>${formatCurrency(gcMarkup)}</td>
      </tr>
    `;
  }

  if ((project.bondInsurancePercentage || 0) > 0) {
    html += `
      <tr>
        <td>Bond & Insurance (${project.bondInsurancePercentage}%)</td>
        <td>${formatCurrency(bondInsurance)}</td>
      </tr>
    `;
  }

  if ((project.contingencyPercentage || 0) > 0) {
    html += `
      <tr>
        <td>Contingency (${project.contingencyPercentage}%)</td>
        <td>${formatCurrency(contingency)}</td>
      </tr>
    `;
  }

  if ((project.salesTaxPercentage || 0) > 0) {
    html += `
      <tr>
        <td>Sales Tax (${project.salesTaxPercentage}%)</td>
        <td>${formatCurrency(salesTax)}</td>
      </tr>
    `;
  }

  html += `
      <tr class="grand-total">
        <td>GRAND TOTAL</td>
        <td>${formatCurrency(grandTotal)}</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <p><strong>Budget Range Estimate:</strong> ${formatCurrency(grandTotal * 0.85)} - ${formatCurrency(grandTotal * 1.15)}</p>
    <p style="margin-top: 10px;">This is a preliminary budget estimate based on typical construction costs. Actual costs may vary based on site conditions, material availability, labor rates, and project-specific requirements. This estimate does not constitute a binding quote.</p>
    <p style="margin-top: 10px;">Generated by BLDR IQ &copy; ${new Date().getFullYear()}</p>
  </div>
</body>
</html>
  `;

  return html;
};

export const downloadPDF = (project: Project, showCostBreakdown: boolean = true) => {
  const htmlContent = generatePDFContent(project, showCostBreakdown);
  
  // Open preview window
  const pdfWindow = window.open('', '_blank');
  if (!pdfWindow) {
    throw new Error('Please allow pop-ups to view PDF');
  }
  
  pdfWindow.document.write(htmlContent);
  pdfWindow.document.close();
};

export const copyToClipboard = (project: Project) => {
  const htmlContent = generatePDFContent(project, false);
  
  // Create a temporary div to hold the content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  document.body.appendChild(tempDiv);
  
  // Select the content
  const range = document.createRange();
  range.selectNode(tempDiv);
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
    
    try {
      document.execCommand('copy');
      selection.removeAllRanges();
      document.body.removeChild(tempDiv);
      return true;
    } catch (err) {
      document.body.removeChild(tempDiv);
      return false;
    }
  }
  
  document.body.removeChild(tempDiv);
  return false;
};
