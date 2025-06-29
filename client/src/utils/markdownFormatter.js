// Convert markdown to simple HTML
export const formatMarkdown = (text) => {
  // First, handle tables separately with a more robust parser
  const tableRegex = /(\|.*\|[\r\n]+\|[\s\-:|]+\|[\r\n]+(\|.*\|[\r\n]+)*)/g;
  const processedText = text.replace(tableRegex, (tableMatch) => {
    const lines = tableMatch.trim().split('\n').filter(line => line.trim());
    if (lines.length < 2) return tableMatch;
    
    const headerRow = lines[0];
    const separatorRow = lines[1];
    const dataRows = lines.slice(2);
    
    // Parse header
    const headers = headerRow.split('|').slice(1, -1).map(h => h.trim());
    
    // Parse data rows
    const rows = dataRows.map(row => 
      row.split('|').slice(1, -1).map(cell => cell.trim())
    );
    
    // Build HTML table
    let htmlTable = '<table class="border-collapse border border-gray-300 w-full my-4">';
    
    // Header row
    htmlTable += '<thead><tr>';
    headers.forEach(header => {
      htmlTable += `<th class="border border-gray-300 px-3 py-2 bg-gray-100 font-semibold">${header}</th>`;
    });
    htmlTable += '</tr></thead>';
    
    // Data rows
    htmlTable += '<tbody>';
    rows.forEach(row => {
      htmlTable += '<tr>';
      row.forEach(cell => {
        htmlTable += `<td class="border border-gray-300 px-3 py-2">${cell}</td>`;
      });
      htmlTable += '</tr>';
    });
    htmlTable += '</tbody></table>';
    
    return htmlTable;
  });

  // Handle bullet points, lists, and horizontal rules
  const lines = processedText.split('\n');
  const formattedLines = [];
  let inList = false;
  let listItems = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this line is a horizontal rule (handle various formats)
    if (line.trim() === '---' || line.trim() === '***' || line.trim() === '___' || 
        line.trim().match(/^[\-\*_]{3,}$/)) {
      // If we were in a list, close it first
      if (inList && listItems.length > 0) {
        formattedLines.push('<ul class="list-disc ml-6 mb-4">');
        listItems.forEach(item => {
          formattedLines.push(`<li class="mb-1">${item}</li>`);
        });
        formattedLines.push('</ul>');
        listItems = [];
        inList = false;
      }
      formattedLines.push('<hr class="my-4 border-gray-300">');
    }
    // Check if this line is a bullet point
    else if (line.trim().match(/^\* (.+)$/)) {
      if (!inList) {
        inList = true;
      }
      // Extract the content after the bullet
      const content = line.trim().replace(/^\* (.+)$/, '$1');
      listItems.push(content);
    } else {
      // If we were in a list and now we're not, close the list
      if (inList && listItems.length > 0) {
        formattedLines.push('<ul class="list-disc ml-6 mb-4">');
        listItems.forEach(item => {
          formattedLines.push(`<li class="mb-1">${item}</li>`);
        });
        formattedLines.push('</ul>');
        listItems = [];
        inList = false;
      }
      formattedLines.push(line);
    }
  }

  // Handle case where list is at the end
  if (inList && listItems.length > 0) {
    formattedLines.push('<ul class="list-disc ml-6 mb-4">');
    listItems.forEach(item => {
      formattedLines.push(`<li class="mb-1">${item}</li>`);
    });
    formattedLines.push('</ul>');
  }

  const textWithLists = formattedLines.join('\n');

  return textWithLists
    // Headers
    .replace(/^#### (.*$)/gim, '<h4 class="text-lg font-semibold mt-4 mb-2">$1</h4>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>')
    
    // Inline code formatting (backticks)
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Final cleanup: remove any remaining raw horizontal rules
    .replace(/^---$/gim, '<hr class="my-4 border-gray-300">')
    .replace(/^\*\*\*$/gim, '<hr class="my-4 border-gray-300">')
    .replace(/^___$/gim, '<hr class="my-4 border-gray-300">')
    
    // Improved line break handling - reduce excessive spacing
    .replace(/\n\n\n+/g, '<br><br>') // Multiple line breaks become just two
    .replace(/\n\n/g, '<br>') // Double line breaks become single
    .replace(/\n/g, ' '); // Single line breaks become spaces
}; 