"use client";

import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const CATEGORIES = [
    "Array", "Binary", "Dynamic Programming", "Graph",
    "Interval", "Linked List", "Matrix", "String", "Tree", "Heap",
];

export function exportToCSV(students, reportType = "both", filename = "students_report.csv") {
    const data = students.map((student) => {
        const row = {
            Name: student.name,
            "Roll Number": student.roll_number || "N/A",
            "LeetCode Username": student.leetcode_username || "N/A",
        };

        if (reportType === "leetcode" || reportType === "both") {
            row["Total Solved"] = student.stats?.totalSolved || 0;
            row["Easy"] = student.stats?.easySolved || 0;
            row["Medium"] = student.stats?.mediumSolved || 0;
            row["Hard"] = student.stats?.hardSolved || 0;
        }

        if (reportType === "blind75" || reportType === "both") {
            row["Blind75 Solved"] = student.blind75?.totalSolved || 0;
            CATEGORIES.forEach((cat) => {
                const solved = student.blind75?.categories?.[cat]?.solved || 0;
                const total = student.blind75?.categories?.[cat]?.total || 0;
                row[`Blind75 - ${cat}`] = `${solved} / ${total}`;
            });
        }

        return row;
    });

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function exportToPDF(students, reportType = "both", filename = "students_report.pdf") {
    const doc = new jsPDF();

    students.forEach((student, index) => {
        if (index > 0) doc.addPage();

        // ── Blue header bar ──
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, 210, 26, "F");
        doc.setFontSize(16);
        doc.setTextColor(255, 255, 255);
        doc.setFont(undefined, "bold");
        doc.text("Student Progress Report", 14, 17);

        // ── Student info ──
        doc.setFontSize(12);
        doc.setTextColor(31, 41, 55);
        doc.setFont(undefined, "bold");
        doc.text(student.name, 14, 36);
        doc.setFont(undefined, "normal");
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        doc.text(
            `Roll No: ${student.roll_number || "N/A"}     LeetCode: ${student.leetcode_username || "N/A"}`,
            14, 43
        );

        let yOffset = 52;

        // ── LeetCode section ──
        if (reportType === "leetcode" || reportType === "both") {
            doc.setFontSize(11);
            doc.setTextColor(31, 41, 55);
            doc.setFont(undefined, "bold");
            doc.text("LeetCode Statistics", 14, yOffset);

            // FIX: use autoTable(doc, { ... }) NOT doc.autoTable()
            autoTable(doc, {
                startY: yOffset + 4,
                head: [["Total Solved", "Easy", "Medium", "Hard"]],
                body: [[
                    student.stats?.totalSolved ?? 0,
                    student.stats?.easySolved ?? 0,
                    student.stats?.mediumSolved ?? 0,
                    student.stats?.hardSolved ?? 0,
                ]],
                theme: "grid",
                headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold", fontSize: 9 },
                bodyStyles: { fontSize: 10, fontStyle: "bold", halign: "center" },
                columnStyles: { 0: { halign: "center" }, 1: { textColor: [21, 128, 61] }, 2: { textColor: [120, 53, 15] }, 3: { textColor: [153, 27, 27] } },
                margin: { left: 14, right: 14 },
            });

            yOffset = doc.lastAutoTable.finalY + 10;
        }

        // ── Blind75 section ──
        if (reportType === "blind75" || reportType === "both") {
            doc.setFontSize(11);
            doc.setTextColor(31, 41, 55);
            doc.setFont(undefined, "bold");
            doc.text("Blind75 Progress by Category", 14, yOffset);

            const blind75Solved = student.blind75?.totalSolved || 0;
            const blind75Total = student.blind75?.totalProblems || 75;

            // FIX: use autoTable(doc, { ... }) NOT doc.autoTable()
            autoTable(doc, {
                startY: yOffset + 4,
                head: [["Category", "Solved", "Total", "Progress %"]],
                body: CATEGORIES.map((cat) => {
                    const solved = student.blind75?.categories?.[cat]?.solved || 0;
                    const total = student.blind75?.categories?.[cat]?.total || 0;
                    const pct = total > 0 ? `${Math.round((solved / total) * 100)}%` : "0%";
                    return [cat, solved, total, pct];
                }),
                foot: [["TOTAL", blind75Solved, blind75Total, `${Math.round((blind75Solved / blind75Total) * 100)}%`]],
                theme: "striped",
                headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold", fontSize: 9 },
                footStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold" },
                alternateRowStyles: { fillColor: [239, 246, 255] },
                columnStyles: { 1: { halign: "center" }, 2: { halign: "center" }, 3: { halign: "center" } },
                styles: { fontSize: 9 },
                margin: { left: 14, right: 14 },
            });
        }
    });

    doc.save(filename);
}
