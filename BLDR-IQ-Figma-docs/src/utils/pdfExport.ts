import { Project } from '../types/project';
import { formatCurrency } from './formatCurrency';
import { scopeOfWorkData } from '../data/scopeOfWork';

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
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #1B2D4F;
      padding-bottom: 15px;
      margin-bottom: 25px;
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

  <div class="line-items">
    <h2 style="color: #1B2D4F; margin-bottom: 10px;">Line Items</h2>
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
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Please allow pop-ups to download PDF');
  }
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load then trigger print dialog
  printWindow.onload = () => {
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
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
