import { jsPDF } from "jspdf";

const generateRandomNumbers = (min: number, max: number, count: number): number[] => {
  const nums = new Set<number>();
  while (nums.size < count) {
    nums.add(Math.floor(Math.random() * (max - min + 1)) + min);
  }
  return Array.from(nums);
};

interface BingoCardData {
  B: number[];
  I: number[];
  N: (number | string)[]; // String for "FREE"
  G: number[];
  O: number[];
}

const createBingoCardData = (): BingoCardData => {
  const nCol = generateRandomNumbers(31, 45, 4);
  // Insert FREE space in the middle of N column
  const nColWithFree: (number|string)[] = [nCol[0], nCol[1], "VRIJ", nCol[2], nCol[3]];

  return {
    B: generateRandomNumbers(1, 15, 5),
    I: generateRandomNumbers(16, 30, 5),
    N: nColWithFree,
    G: generateRandomNumbers(46, 60, 5),
    O: generateRandomNumbers(61, 75, 5),
  };
};

export const generateBingoCardsPdf = () => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  
  // Margins and Spacing
  const margin = 10;
  const cardWidth = (pageWidth - (margin * 3)) / 2;
  const cardHeight = (pageHeight - (margin * 3)) / 2;

  // Colors based on the Tailwind config
  const colors = {
    B: [59, 130, 246], // #3b82f6
    I: [239, 68, 68],  // #ef4444
    N: [16, 185, 129], // #10b981
    G: [234, 179, 8],  // #eab308
    O: [168, 85, 247], // #a855f7
  };

  const drawCard = (x: number, y: number, cardData: BingoCardData) => {
    // Draw Card Border
    doc.setDrawColor(50, 50, 50);
    doc.setLineWidth(0.5);
    doc.rect(x, y, cardWidth, cardHeight);

    // Header Height
    const headerHeight = cardHeight / 7; // Approx size for header
    const cellWidth = cardWidth / 5;
    const cellHeight = (cardHeight - headerHeight) / 5;

    // Draw Headers (B I N G O)
    const headers = ['B', 'I', 'N', 'G', 'O'];
    
    headers.forEach((letter, i) => {
      const hx = x + (i * cellWidth);
      const hy = y;
      
      // Background for letter
      const rgb = colors[letter as keyof typeof colors];
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      doc.rect(hx, hy, cellWidth, headerHeight, 'F');
      
      // Letter Text
      doc.setTextColor(255, 255, 255);
      // Yellow (G) needs black text usually, but white works if dark enough, keeping white for consistency or checking G
      if (letter === 'G') doc.setTextColor(0, 0, 0); 

      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(letter, hx + cellWidth / 2, hy + headerHeight / 1.5, { align: 'center', baseline: 'middle' });
    });

    // Draw Grid and Numbers
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    
    // Rows
    for (let r = 0; r < 5; r++) {
      // Columns
      headers.forEach((letter, c) => {
        const val = cardData[letter as keyof typeof cardData][r];
        const cx = x + (c * cellWidth);
        const cy = y + headerHeight + (r * cellHeight);

        // Cell border
        doc.setDrawColor(200, 200, 200);
        doc.rect(cx, cy, cellWidth, cellHeight);

        // Value
        const centerX = cx + cellWidth / 2;
        const centerY = cy + cellHeight / 2;

        if (val === "VRIJ") {
          doc.setFontSize(10);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(150, 150, 150);
          doc.text("VRIJ", centerX, centerY, { align: 'center', baseline: 'middle' });
        } else {
          doc.setFontSize(20);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(50, 50, 50);
          doc.text(String(val), centerX, centerY, { align: 'center', baseline: 'middle' });
        }
      });
    }
    
    // Add a small footer/ID
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Card ID: ${Math.floor(Math.random() * 10000)}`, x + cardWidth - 2, y + cardHeight + 4, { align: 'right' });
  };

  // Draw 4 cards
  const positions = [
    { x: margin, y: margin }, // Top Left
    { x: margin + cardWidth + margin, y: margin }, // Top Right
    { x: margin, y: margin + cardHeight + margin }, // Bottom Left
    { x: margin + cardWidth + margin, y: margin + cardHeight + margin }, // Bottom Right
  ];

  positions.forEach(pos => {
    drawCard(pos.x, pos.y, createBingoCardData());
  });

  doc.save("bingo-kaarten.pdf");
};