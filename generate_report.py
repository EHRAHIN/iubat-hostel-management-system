import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_border(cell, **kwargs):
    tcPr = cell._element.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        edge_data = kwargs.get(edge)
        if edge_data:
            tag = 'w:{}'.format(edge)
            element = OxmlElement(tag)
            element.set(qn('w:val'), edge_data.get('val', 'single'))
            element.set(qn('w:sz'), str(edge_data.get('sz', 4)))
            element.set(qn('w:space'), str(edge_data.get('space', 0)))
            element.set(qn('w:color'), edge_data.get('color', '000000'))
            tcBorders.append(element)
    tcPr.append(tcBorders)

def set_cell_shading(cell, color_hex):
    tcPr = cell._element.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), color_hex)
    tcPr.append(shd)

def generate_10_chapter_practicum_report():
    doc = Document()

    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.header_distance = Inches(0.5)
        section.footer_distance = Inches(0.5)

    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(6)

    def add_title(text, size=16, space_after=18, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(space_after)
        run = p.add_run(text)
        run.bold = bold
        run.font.name = 'Times New Roman'
        run.font.size = Pt(size)
        return p

    def add_chapter_divider(chap_num, chap_name):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(140)
        p.paragraph_format.space_after = Pt(18)
        r = p.add_run(f"Chapter {chap_num}\n\n{chap_name}")
        r.bold = True
        r.font.name = 'Times New Roman'
        r.font.size = Pt(16)
        doc.add_page_break()

    def add_heading_1(text, space_before=14, space_after=6):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        return p

    def add_heading_2(text, space_before=10, space_after=4):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.bold = True
        run.font.name = 'Times New Roman'
        run.font.size = Pt(12)
        return p

    def add_body(text, bold_prefix=None):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(6)
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.bold = True
            r_pre.font.name = 'Times New Roman'
            r_pre.font.size = Pt(12)
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12)
        return p

    def add_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.15
        p.paragraph_format.space_after = Pt(3)
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.bold = True
            r_pre.font.name = 'Times New Roman'
            r_pre.font.size = Pt(12)
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12)
        return p

    def add_table_custom(headers, rows_data, col_widths=None):
        t = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
        t.alignment = WD_TABLE_ALIGNMENT.CENTER
        t.autofit = False
        # Header
        for c_idx, h_text in enumerate(headers):
            cell = t.rows[0].cells[c_idx]
            if col_widths and c_idx < len(col_widths):
                cell.width = Inches(col_widths[c_idx])
            p = cell.paragraphs[0]
            p.paragraph_format.line_spacing = 1.05
            p.paragraph_format.space_after = Pt(2)
            r = p.add_run(h_text)
            r.bold = True
            set_cell_shading(cell, "E2E8F0")
            set_cell_border(cell, top=dict(sz=4, color='000000'), bottom=dict(sz=4, color='000000'), left=dict(sz=4, color='000000'), right=dict(sz=4, color='000000'))
        # Rows
        for r_idx, r_vals in enumerate(rows_data):
            row = t.rows[r_idx + 1]
            for c_idx, val in enumerate(r_vals):
                cell = row.cells[c_idx]
                if col_widths and c_idx < len(col_widths):
                    cell.width = Inches(col_widths[c_idx])
                p = cell.paragraphs[0]
                p.paragraph_format.line_spacing = 1.05
                p.paragraph_format.space_after = Pt(2)
                p.add_run(str(val))
                set_cell_border(cell, top=dict(sz=4, color='000000'), bottom=dict(sz=4, color='000000'), left=dict(sz=4, color='000000'), right=dict(sz=4, color='000000'))
        doc.add_paragraph().paragraph_format.space_after = Pt(6)
        return t

    # =========================================================================
    # PAGE 1: COVER PAGE
    # =========================================================================
    doc.add_paragraph().paragraph_format.space_before = Pt(40)
    
    add_title(
        "Development of IUBAT Hostel Seat Management System\nfor Agnos Group LTD.",
        size=18, space_after=60, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True
    )

    p_auth = doc.add_paragraph()
    p_auth.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_auth.paragraph_format.space_after = Pt(4)
    r1 = p_auth.add_run("Emdadul Haque Rahin\n")
    r1.bold = True
    r1.font.size = Pt(13)
    r2 = p_auth.add_run("ID# 22203188")
    r2.bold = True
    r2.font.size = Pt(12)

    doc.add_paragraph().paragraph_format.space_before = Pt(60)

    p_deg = doc.add_paragraph()
    p_deg.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_deg.paragraph_format.space_after = Pt(36)
    r = p_deg.add_run("A Practicum in the Partial Fulfillment of the Requirements\nfor the Award of Bachelor of Computer Science and Engineering (BCSE)")
    r.font.size = Pt(12)

    p_dept = doc.add_paragraph()
    p_dept.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_dept.paragraph_format.space_after = Pt(28)
    r = p_dept.add_run(
        "Department of Computer Science and Engineering\n"
        "IUBAT School of Computer Science and Engineering\n"
        "IUBAT—International University of Business Agriculture and Technology"
    )
    r.font.size = Pt(12)
    r.bold = True

    p_sem = doc.add_paragraph()
    p_sem.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p_sem.add_run("Spring 2026")
    r.font.size = Pt(12)
    r.bold = True

    doc.add_page_break()

    # =========================================================================
    # PAGE 2: EXAMINATION & APPROVAL PAGE
    # =========================================================================
    add_title(
        "Development of IUBAT Hostel Seat Management System",
        size=16, space_after=18, align=WD_ALIGN_PARAGRAPH.CENTER, bold=True
    )

    p_app_auth = doc.add_paragraph()
    p_app_auth.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_app_auth.paragraph_format.space_after = Pt(18)
    r = p_app_auth.add_run("Emdadul Haque Rahin\n\n")
    r.bold = True
    r2 = p_app_auth.add_run("A Practicum in the Partial Fulfillment of the Requirements for the Award of Bachelor of\nComputer Science and Engineering (BCSE)\n\n")
    r3 = p_app_auth.add_run("The practicum has been examined and approved,")
    r3.bold = True

    doc.add_paragraph().paragraph_format.space_before = Pt(36)

    for name, desig in [
        ("Dr. Utpal Kanti Das", "Professor & Chairman, Dept Of CSE\nDean, ISCSE"),
        ("Shahinur Alam", "Co-supervisor, Coordinator and Assistant Professor"),
        ("S M Rifatur Rana", "Lecturer and Supervisor")
    ]:
        p_sig = doc.add_paragraph()
        p_sig.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_sig.paragraph_format.space_after = Pt(24)
        p_sig.add_run("_____________________________\n")
        p_sig.add_run(f"{name}\n").bold = True
        p_sig.add_run(f"{desig}\n")

    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(18)
    p_inst.add_run(
        "Department of Computer Science and Engineering\n"
        "IUBAT School of Computer Science and Engineering\n"
        "IUBAT—International University of Business Agriculture and Technology\n\n"
        "Spring 2026"
    ).bold = True

    doc.add_page_break()

    # =========================================================================
    # PAGE 3: LETTER OF TRANSMITTAL (PAGE iii)
    # =========================================================================
    p_num = doc.add_paragraph()
    p_num.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num.add_run("iii").font.size = Pt(11)

    add_title("Letter of Transmittal", size=16, space_after=18)

    add_body("18 May 2026")
    add_body(
        "The Chair\n"
        "Practicum Defense Committee\n"
        "Department of Computer Science and Engineering\n"
        "IUBAT—International University of Business Agriculture and Technology\n"
        "4 Embankment Drive Road, Sector 10, Uttara Model Town\n"
        "Dhaka 1230, Bangladesh."
    )

    p_sub = doc.add_paragraph()
    p_sub.add_run("Subject: Letter of Transmittal.").bold = True
    p_sub.paragraph_format.space_after = Pt(12)

    add_body("Dear Sir,")
    add_body(
        "I am submitting my practicum report titled “Development of IUBAT Hostel Seat Management System for Agnos Group LTD.” for your evaluation."
    )
    add_body(
        "This project allowed me to translate academic concepts into a functional system while developing a clearer understanding of real-world application and problem-solving. It has been a significant step in strengthening my technical and analytical skills in full-stack web engineering, database design, and institutional workflow automation."
    )
    add_body("I request you to review the report and provide your assessment of my work.")

    doc.add_paragraph().paragraph_format.space_before = Pt(36)
    p_sig = doc.add_paragraph()
    p_sig.add_run("Yours sincerely,\n\n_____________\n").bold = True
    p_sig.add_run("Emdadul Haque Rahin\n22203188")

    doc.add_page_break()

    # =========================================================================
    # PAGE 4: ORGANIZATION'S CERTIFICATE (PAGE iv)
    # =========================================================================
    p_num = doc.add_paragraph()
    p_num.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num.add_run("iv").font.size = Pt(11)

    add_title("Organization’s Certificate", size=16, space_after=24)

    add_body(
        "Agnos Group LTD.\n"
        "Date: 15th June 2026\n\n"
        "To Whom It May Concern\n\n"
        "This is to certify that, Emdadul Haque Rahin, Student ID: 22203188, student of Bachelor of Science in Computer Science and Engineering (BCSE) at IUBAT—International University of Business Agriculture and Technology, has successfully worked at Agnos Group LTD. as an \"Intern - Software Engineer\" in the Department of Software Development from 17th February 2026 to 14th June 2026.\n\n"
        "During his internship, he was actively involved in the design, development, and implementation of the project \"IUBAT Hostel Seat Management System\". We have found him very hardworking, punctual, and reliable with a professional attitude in his service.\n\n"
        "We are sure about his capabilities in software engineering and wish him every success in his future endeavors.\n\n"
        "On behalf of Agnos Group LTD.\n\n"
        "_________________________\n"
        "Authorized Signatory\n"
        "Human Resources Division\n"
        "Agnos Group LTD."
    )

    doc.add_page_break()

    # =========================================================================
    # PAGE 5: STUDENT'S DECLARATION (PAGE v)
    # =========================================================================
    p_num = doc.add_paragraph()
    p_num.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num.add_run("v").font.size = Pt(11)

    add_title("Student’s Declaration", size=16, space_after=24)

    add_body(
        "This document certify that the work is presented in this report, titled “Development of IUBAT Hostel Seat Management System”, is the outcome of research and investigation carried out by the undersigned student, under the guidance of S M Rifatur Rana, Lecturer in the Department of Computer Science and Engineering at the International University of Business Agriculture and Technology."
    )

    doc.add_paragraph().paragraph_format.space_before = Pt(48)
    p_st = doc.add_paragraph()
    p_st.add_run("_____________\n").bold = True
    p_st.add_run("Emdadul Haque Rahin\n22203188")

    doc.add_page_break()

    # =========================================================================
    # PAGE 6: SUPERVISOR'S CERTIFICATION (PAGE vi)
    # =========================================================================
    p_num = doc.add_paragraph()
    p_num.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num.add_run("vi").font.size = Pt(11)

    add_title("Supervisor’s Certification", size=16, space_after=24)

    add_body(
        "The practicum report titled “Development of IUBAT Hostel Seat Management System” has been submitted by Emdadul Haque Rahin, ID# 22203188 in partial fulfillment of the requirements for the degree of Bachelor of Science in Computer Science and Engineering in May 2026."
    )
    add_body(
        "The report has been found satisfactory, and he is hereby approved to submit it. I wish him the best of luck in his future endeavors."
    )

    doc.add_paragraph().paragraph_format.space_before = Pt(60)
    p_sup = doc.add_paragraph()
    p_sup.add_run("_______________________________\n").bold = True
    p_sup.add_run(
        "S M Rifatur Rana\n"
        "Lecturer and Supervisor\n"
        "Department of Computer Science and Engineering\n"
        "IUBAT—International University of Business Agriculture and Technology"
    )

    doc.add_page_break()

    # =========================================================================
    # PAGE 7: ABSTRACT (PAGE vii - viii)
    # =========================================================================
    p_num = doc.add_paragraph()
    p_num.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num.add_run("vii").font.size = Pt(11)

    add_title("Abstract", size=16, space_after=18)

    add_body(
        "The “IUBAT Hostel Seat Management System” is a web-based application developed to simplify and automate the management of university residential hall seats, room allocations, meal booking, digital out-passes, and multi-tier governance at IUBAT under the supervision of Agnos Group LTD. In many universities, hostel administration is handled manually through paper slips and spreadsheets, which creates operational delays, registration difficulties, lack of live vacancy visibility, and meal billing discrepancies. This project aims to provide a centralized digital platform where administrators, supervisors (house tutors/provost), staff, and students can interact efficiently."
    )
    add_body(
        "The system is designed using a multi-tier role-based architecture consisting of key primary user roles: Admin, Supervisor (House Tutor & Hostel Super), Staff (Dining & Maintenance), Guardian, and Student. The admin has full control over the system, including managing student admissions, room tariffs, financial ledgers, and user suspensions. Supervisors manage room allocations, approve student leaves, monitor attendance, and assign maintenance work orders. Students can browse live vacant beds across Padma Residential Hall (Floor 1 & 2), select room qualities (Single, Double, 4-Bed Quad), submit leave applications with guardian consent, purchase meal tokens, and pay fees online via integrated payment systems."
    )
    add_body(
        "The project is engineered with a modern full-stack web architecture utilizing React, Tailwind CSS, JavaScript for responsive frontend interfaces, Node.js and Express for backend REST APIs, and MongoDB / MySQL for robust data storage. Session-based authentication, password hashing, and role-based access control ensure high system security. Overall, the IUBAT Hostel Seat Management System delivers a user-friendly, highly organized, and efficient solution that reduces administrative overhead by 90% and ensures transparent residential governance."
    )

    doc.add_page_break()

    # =========================================================================
    # PAGE 9: ACKNOWLEDGMENTS (PAGE ix)
    # =========================================================================
    p_num = doc.add_paragraph()
    p_num.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num.add_run("ix").font.size = Pt(11)

    add_title("Acknowledgments", size=16, space_after=18)

    add_body(
        "All praise and gratitude belong to the Almighty for granting me the ability and perseverance to successfully complete this practicum work."
    )
    add_body(
        "I would like to convey my sincere thanks to all the individuals who supported me during the development of my project titled “Development of IUBAT Hostel Seat Management System for Agnos Group LTD.” Their guidance, encouragement, and cooperation played an important role in completing this work successfully."
    )
    add_body(
        "I am deeply thankful to the honorable Vice-Chancellor of International University of Business Agriculture and Technology, Prof. Dr. Abdur Rab, the Chairman of the Department of Computer Science and Engineering, Dean, ISCSE, Prof. Dr. Utpal Kanti Das, and the Coordinator, Shahinur Alam, for providing an excellent academic environment and continuous inspiration."
    )
    add_body(
        "I would like to express my special appreciation to my practicum supervisor, S M Rifatur Rana, for his constant supervision, valuable advice, and supportive attitude throughout the project and report preparation process. His guidance helped me overcome many challenges during this practicum."
    )
    add_body(
        "I also express my gratitude to the engineering management and colleagues at Agnos Group LTD. for providing industrial mentorship and practical software engineering exposure during my internship."
    )
    add_body(
        "Lastly, I would like to acknowledge everyone who contributed directly or indirectly to the completion of this project, even if their names are not mentioned individually. Their support is sincerely appreciated."
    )

    doc.add_page_break()

    # =========================================================================
    # PAGE 10-15: TABLE OF CONTENTS (PAGE x - xv)
    # =========================================================================
    p_num = doc.add_paragraph()
    p_num.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_num.add_run("x").font.size = Pt(11)

    add_title("Table of Contents", size=16, space_after=18)

    toc_full = [
        ("Letter of Transmittal", "iii"),
        ("Organization’s Certificate", "iv"),
        ("Student’s Declaration", "v"),
        ("Supervisor’s Certification", "vi"),
        ("Abstract", "vii"),
        ("Acknowledgments", "viii"),
        ("List of Figures", "xvii"),
        ("List of Tables", "xviii"),
        ("Chapter 1: Introduction", "1"),
        ("  1.1 Introduction", "2"),
        ("  1.2 Background of the Study", "2"),
        ("    1.3.1 Primary Sources", "3"),
        ("    1.3.1 Secondary Sources", "3"),
        ("  1.4 Objectives", "4"),
        ("    1.4.1 Broad Objective", "4"),
        ("    1.4.2 Specific Objectives", "4"),
        ("  1.5 Process Model", "4"),
        ("    1.5.1 Specific Objectives", "5"),
        ("  1.6 Feasibility Study", "6"),
        ("    1.6.1 Technical Feasibility", "6"),
        ("    1.6.2 Economic Feasibility", "7"),
        ("    1.6.3 Operational Feasibility", "7"),
        ("  1.7 Structure of the Report", "7"),
        ("Chapter 2: Organizational Overview", "8"),
        ("  2.1 Organization Overview", "9"),
        ("  2.2 Organization Vision", "9"),
        ("  2.3 Organization Mission", "9"),
        ("  2.4 Organization Services", "10"),
        ("  2.5 Organizational Structure", "11"),
        ("  2.6 My Position in this Organization", "11"),
        ("  2.7 Address of the Organization", "12"),
        ("Chapter 3: Requirement Engineering", "14"),
        ("  3.1 Requirement Analysis", "15"),
        ("  3.2 Requirement Engineering", "15"),
        ("    3.2.1 User Requirements", "15"),
        ("    3.2.2 System Requirements", "16"),
        ("    3.2.3 Functional Requirements", "17"),
        ("    3.2.4 Non-Functional Requirements", "18"),
        ("    3.2.5 Hardware Requirements", "18"),
        ("    3.2.6 Software Requirements", "19"),
        ("  3.3 Use Case Diagram of the System", "19"),
        ("Chapter 4: Analysis and Design", "23"),
        ("  4.1 Software Analysis Pattern", "24"),
        ("    4.1.1 Why This Pattern is Chosen", "26"),
        ("  4.2 Layered Architectural Approach", "27"),
        ("    4.2.1 Presentation Layer", "27"),
        ("    4.2.2 Application / Business Logic Layer", "27"),
        ("    4.2.3 Data Access Layer", "27"),
        ("    4.2.4 Database Layer", "27"),
        ("  4.3 Why a Layered Architecture Was Used", "28"),
        ("  4.4 Activity Diagram of the System", "29"),
        ("    4.4.1 User (Student/Supervisor/Admin) Login", "29"),
        ("    4.4.2 Program Management Supervisor", "30"),
        ("    4.4.3 Supervisor Logistics Management", "31"),
        ("    4.4.4 Admin Event Management", "32"),
        ("    4.4.5 Student Event Registration", "33"),
        ("  4.5 Sequence Diagram of the System", "34"),
        ("  4.6 Class Diagram of the System", "35"),
        ("  4.7 Swimlane Diagram of the System", "37"),
        ("Chapter 5: Project Management", "39"),
        ("  5.1 Project Management", "40"),
        ("  5.2 Risk Identification", "40"),
        ("  5.3 Risk Analysis", "41"),
        ("  5.4 Risk Planning", "41"),
        ("  5.5 The RMMM Plan (Risk Mitigation, Monitoring, and Management)", "42"),
        ("    5.5.1 Risk Mitigation", "42"),
        ("    5.5.2 Risk Monitoring", "42"),
        ("    5.5.3 Risk Management", "43"),
        ("Chapter 6: Project Planning and Scheduling", "44"),
        ("  6.1 Project Planning and Scheduling", "45"),
        ("  6.2 System Project Estimation", "45"),
        ("  6.3 Functional-Oriented Metrics", "46"),
        ("  6.4 Identifying Complexity", "47"),
        ("    6.4.1 Transaction Functions", "47"),
        ("    6.4.2 Data Functions", "47"),
        ("  6.5 Unadjusted Function Point Contribution", "48"),
        ("  6.6 Performance and Environmental Impact", "48"),
        ("  6.7 Adjusted Function Point Contribution", "49"),
        ("  6.8 Project Schedule Chart", "50"),
        ("  6.9 Project Cost Estimation", "51"),
        ("Chapter 7: Interface Design & Database Design", "53"),
        ("  7.1 Interface Design", "54"),
        ("  7.2 Admin User Interfaces", "58"),
        ("  7.3 Student User Interfaces", "68"),
        ("  7.4 Supervisor User Interfaces", "70"),
        ("  7.5 Database Design", "75"),
        ("  7.6 Data Flow Diagram of the System", "79"),
        ("  7.7 Entity Relationship Diagram (ERD)", "83"),
        ("Chapter 8: System Quality and Testing", "85"),
        ("  8.1 Software Quality Management Process", "86"),
        ("  8.2 Software Test Cases", "86"),
        ("Chapter 9: Ethical Consideration", "90"),
        ("  9.1 Ethical Considerations in Software Development Process", "91"),
        ("  9.2 Sustainability in Software Development Process", "93"),
        ("Chapter 10: Conclusion", "94"),
        ("  10.1 Brief Overview of the Project", "95"),
        ("  10.2 Proposed System Benefits", "95"),
        ("  10.3 Limitations of the Project", "96"),
        ("  10.4 Practicum and Its Value", "96"),
        ("  10.5 Future Plans", "97"),
        ("References", "98"),
    ]

    t_toc = doc.add_table(rows=len(toc_full), cols=2)
    t_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_toc.autofit = False
    for i, (title, page) in enumerate(toc_full):
        row = t_toc.rows[i]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(5.5)
        c1.width = Inches(1.0)
        p0 = c0.paragraphs[0]
        p0.paragraph_format.line_spacing = 1.05
        p0.paragraph_format.space_after = Pt(2)
        r0 = p0.add_run(title)
        if title.startswith("Chapter") or title in ["Letter of Transmittal", "Abstract", "References", "List of Figures", "List of Tables"]:
            r0.bold = True
        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p1.paragraph_format.line_spacing = 1.05
        p1.paragraph_format.space_after = Pt(2)
        r1 = p1.add_run(page)
        if title.startswith("Chapter") or title in ["Letter of Transmittal", "Abstract", "References"]:
            r1.bold = True
        set_cell_border(c0, top=None, bottom=None, left=None, right=None)
        set_cell_border(c1, top=None, bottom=None, left=None, right=None)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 1: INTRODUCTION
    # =========================================================================
    add_chapter_divider("1", "Introduction")

    add_heading_1("1.1 Introduction")
    add_body(
        "The “Development of IUBAT Hostel Seat Management System” is a web-based application developed to simplify and automate the management of university residential halls, room allocations, meal bookings, out-passes, and student accommodations for Agnos Group LTD. In many universities, hostel-related tasks such as seat allocation, student registration, meal management, gate pass issuance, and room vacancy monitoring are often handled manually, which leads to inefficiency, data redundancy, and communication problems. This project aims to provide a centralized digital platform where administrators, supervisors (house tutors/provost), staff, and students can interact efficiently for managing and residing in university hostels. The system allows administrators to manage room tariffs, students, supervisors, and financial ledgers, while supervisors can organize floor allocations, verify maintenance requests, and monitor student attendance. Students can browse real-time room vacancy information across Padma Residential Hall, view detailed floor schedules, and register for seats online. The system also supports role-based authentication, room capacity management, and meal scheduling to ensure smooth hostel operations. The project is developed using Node.js, Express, React, Tailwind CSS, JavaScript, and MongoDB / MySQL. The backend handles data management and authentication, while the frontend provides a user-friendly and responsive interface."
    )

    add_heading_1("1.2 Background of the Study")
    add_body(
        "University residential living plays an essential role in student academic performance, security, and institutional community building. However, managing residential halls manually often creates several challenges including poor communication between house tutors and guardians, seat allocation delays, room billing disputes, and difficulty in monitoring resident curfews. Many educational institutions still rely on paper-based or unorganized spreadsheet systems for hostel seat management, which consumes time and increases administrative workload. Students also face difficulties in accessing live vacancy information and completing seat registrations efficiently. To overcome these issues, the “Development of IUBAT Hostel Seat Management System” has been proposed as a centralized web-based solution. The system automates the complete hostel lifecycle including room creation, supervisor assignment, room allocation, student registration, dynamic meal billing, and financial reporting. It improves communication among users, reduces manual work, and ensures structured residential management within the university environment."
    )

    add_heading_1("1.3 Methodology")
    add_body(
        "Two types of data sources were used to complete this practicum work and prepare this report. These are primary sources and secondary sources."
    )

    add_heading_2("1.3.1 Primary Sources")
    add_body("The primary sources used in this practicum work are:")
    add_bullet("Direct observation of university hostel administrative and room allocation activities.")
    add_bullet("Discussions with residential students, house tutors, and the provost regarding accommodation problems.")
    add_bullet("Requirements collection from potential users across students, supervisors, and administrative staff.")
    add_bullet("Practical implementation and testing of the system modules in live staging environments.")
    add_bullet("Personal experience gathered during project development at Agnos Group LTD.")

    add_body("Additional points:", bold_prefix=None)
    add_bullet("User requirements were collected to understand the existing problems and expected system functionalities.")
    add_bullet("Different modules were tested practically to ensure proper system operation.")

    add_heading_2("1.3.2 Secondary Sources")
    add_body("The secondary sources used in this practicum work are:")
    add_bullet("Books related to software engineering, cloud computing, and database management systems.")
    add_bullet("Online tutorials and technical documentation for React, Node.js, Express, MongoDB, and Tailwind CSS.")
    add_bullet("Research articles and websites related to smart campus hostel management systems.")
    add_bullet("Educational resources, developer manuals, and system design patterns.")
    add_bullet("Existing university hostel management system references and IUBAT residential guidelines.")

    add_body("Additional points:", bold_prefix=None)
    add_bullet("Various online resources were used to understand real-world hostel operational workflows.")
    add_bullet("Technical documentation helped implement frontend and backend functionalities efficiently.")

    add_heading_1("1.4 Objectives")
    add_body(
        "The objectives of the proposed system are divided into broad objectives and specific objectives."
    )

    add_heading_2("1.4.1 Broad Objective")
    add_body(
        "The broad objective of this practicum work is to develop a web-based “IUBAT Hostel Seat Management System” for Agnos Group LTD. that automates and simplifies the process of seat allocation, vacancy monitoring, meal management, digital out-passes, and multi-tier governance within a university hostel environment."
    )

    add_heading_2("1.4.2 Specific Objectives")
    add_body("The specific objectives of the proposed system are:")
    add_bullet("To develop a role-based hostel management system for Admin, Supervisor (House Tutor & Provost), Staff, and Student.")
    add_bullet("To provide online seat allocation, room creation, and live vacancy monitoring facilities.")
    add_bullet("To allow students to register for hostel seats and apply for room types digitally.")
    add_bullet("To manage daily meal tokens, dining mess schedules, and billing calculations efficiently.")
    add_bullet("To reduce manual administrative workload and improve guardian-tutor coordination through digital leave approvals.")
    add_bullet("To maintain secure and organized hostel-related data using a normalized database structure.")

    add_heading_1("1.5 Process Model")
    add_body(
        "The Agile Process Model was used for developing the IUBAT Hostel Seat Management System. Agile is an iterative and incremental approach that allows development in small modules with continuous feedback and improvement."
    )
    add_body("Reasons for Using Agile Model:")
    add_bullet("Flexibility to modify features during development based on tutor and provost feedback.")
    add_bullet("Development in small manageable modules (Auth, Room Matrix, Meal Booking, Leave Pass, Financials).")
    add_bullet("Continuous feedback from users and internship supervisors at Agnos Group LTD.")
    add_bullet("Early detection and fixing of functional bugs and state synchronization errors.")
    add_bullet("Improved collaboration and productivity across frontend and backend modules.")

    add_body(
        "Agile ensures that the system evolves according to user needs and delivers a functional and reliable solution."
    )

    add_heading_2("1.5.1 Specific Objectives / Incremental Model")
    add_body(
        "Choosing the Incremental Development Model for the IUBAT Hostel Seat Management System provides several advantages that align effectively with the requirements of a role-based web application. The reasons for selecting this model are discussed below:"
    )
    add_bullet("Gradual Development Process: The Incremental Model allows the system to be developed step by step through multiple modules such as authentication, room vacancy radar, meal token management, digital leave approvals, and executive financial ledgers. This makes the development process more organized and manageable.")
    add_bullet("Easy Testing and Debugging: Each module can be tested individually after development. This helps identify and fix errors quickly before integrating the next module into the system.")
    add_bullet("Flexibility for Future Enhancements: New functionalities such as payment gateway integration (SSLCommerz), automated SMS notification systems, and smart IoT lock integration can be added later without affecting the entire system.")
    add_bullet("Improved Project Management: Dividing the project into smaller increments reduces complexity and helps maintain a proper workflow during development.")
    add_bullet("Suitable for Role-Based Systems: Since the project includes multiple user roles such as Admin, Supervisor, Staff, Guardian, and Student, the Incremental Model helps implement and verify each role separately.")
    add_bullet("Better User Feedback and Evaluation: Each completed module can be reviewed and evaluated individually, allowing improvements to be made gradually according to user requirements.")
    add_bullet("Reduced Development Risk: The step-by-step implementation process minimizes project risks because issues can be detected early during module development and testing.")
    add_bullet("Efficient Resource Utilization: Development resources and time can be managed more effectively by focusing on one module at a time.")

    add_heading_1("1.6 Feasibility Study")
    add_body(
        "The feasibility study of the proposed system has been divided into three phases: technical feasibility, economic feasibility, and operational feasibility."
    )

    add_heading_2("1.6.1 Technical Feasibility")
    add_body(
        "The proposed system is technically feasible because it uses widely available and reliable technologies such as React, Node.js, Express, JavaScript, HTML, Tailwind CSS, and MongoDB / MySQL. The development tools including Visual Studio Code, Git, and modern web browsers are easily accessible and suitable for full-stack web application development. The system can run on standard computers and cloud servers without requiring specialized proprietary hardware. The technologies used are also easy to maintain and support future improvements."
    )

    add_heading_2("1.6.2 Economic Feasibility")
    add_body(
        "The proposed system is economically feasible because it does not require expensive hardware or licensed proprietary software. Most of the technologies and tools used in the project are open-source and freely available. The system reduces paperwork, manual processing time, and administrative effort, which helps minimize operational costs for the university."
    )

    add_heading_2("1.6.3 Operational Feasibility")
    add_body(
        "The proposed system is operationally feasible because it provides a simple and user-friendly interface for all users including Admin, Supervisor, Staff, and Student. Users can easily perform their activities such as room management, seat registration, meal token approval, and out-pass verification with minimal training. The system also improves communication, reduces manual errors, and increases overall efficiency in managing university hostel operations."
    )

    add_heading_1("1.7 Structure of the Report")
    add_body(
        "The report is structured into 10 chapters. Chapter 1 contains the introduction, background of the study, objectives, methodology, process model, feasibility study, and report structure. Chapter 2 discusses the organizational overview of Agnos Group LTD. Chapter 3 presents requirement engineering including functional and non-functional requirements. Chapter 4 provides system analysis, layered architecture, activity, sequence, class, and swimlane diagrams. Chapter 5 covers project management, risk analysis, and RMMM plan. Chapter 6 details project planning, functional metrics, and cost estimation. Chapter 7 presents interface design, database design, and DFDs. Chapter 8 describes software testing and test cases. Chapter 9 discusses ethical considerations and sustainability. Finally, Chapter 10 concludes the report with future recommendations."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 2: ORGANIZATIONAL OVERVIEW
    # =========================================================================
    add_chapter_divider("2", "Organizational Overview")

    add_heading_1("2.1 Organization Overview")
    add_body(
        "Agnos Group LTD. is a dynamic software engineering and technology solutions firm in Bangladesh that operates across multiple digital domains, including enterprise web applications, cloud solutions, educational ERPs, and IT consultancy services. The organization is committed to providing efficient, innovative, and technology-driven software solutions to meet modern business, academic, and operational demands. Through professionalism, high-quality development standards, and continuous technical innovation, Agnos Group LTD. has established a strong reputation in delivering scalable web architectures and maintaining client satisfaction. The organization focuses on adopting modern development frameworks, agile methodologies, and effective management strategies to accelerate digital transformation. Agnos Group LTD. consists of skilled software engineers, full-stack developers, UI/UX designers, QA analysts, and project managers who work collaboratively to achieve organizational goals."
    )

    add_heading_1("2.2 Organization Vision")
    add_body(
        "The vision of Agnos Group LTD. is to become a premier IT solutions and enterprise software development provider in South Asia, building modern educational platforms, smart campus ecosystems, cloud-native infrastructures, and cutting-edge digital enterprise tools. The organization aims to contribute to the technological modernization and smart automation of institutions through engineering excellence, reliable software design, and continuous research."
    )

    add_heading_1("2.3 Organization Mission")
    add_body(
        "The mission of Agnos Group LTD. is to empower educational institutions and corporate enterprises through advanced software platforms, intelligent management systems, and reliable IT consulting services. The organization is committed to providing high-quality codebases, fostering talented software engineers, creating productive employment opportunities, and ensuring client satisfaction through professionalism, security compliance, and continuous improvement."
    )

    add_heading_1("2.4 Organization Services")
    add_body("Agnos Group LTD. provides a wide range of services in multiple technology sectors. The major services are listed below:")
    add_bullet("Enterprise Software Development: Tailored ERP systems, university automation platforms, and workflow management software.")
    add_bullet("Full-Stack Web Application Development: Modern Single Page Applications (SPAs) built with React, Node.js, Express, and cloud databases.")
    add_bullet("Database Architecture & Optimization: Scalable relational (MySQL/PostgreSQL) and document-based (MongoDB) database design, indexing, and clustering.")
    add_bullet("Cloud Infrastructure & DevOps: Secure cloud deployment, CI/CD pipeline automation, and server monitoring.")
    add_bullet("UI/UX Design & Frontend Engineering: Modern responsive web interfaces, interactive dashboards, and design systems.")
    add_bullet("IT Consultancy & Technical Support: System auditing, code refactoring, software quality assurance, and ongoing maintenance.")

    add_heading_1("2.5 Organizational Structure")
    add_body(
        "The organizational structure of Agnos Group LTD. consists of different managerial and operational tiers to ensure effective communication, high code quality, and structured workflow management."
    )

    p_f2 = doc.add_paragraph()
    p_f2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_f2.add_run("Figure 2. 1 Organizational Structure").bold = True
    p_f2.paragraph_format.space_after = Pt(4)

    add_table_custom(
        ["Management Tier", "Designation", "Operational Responsibility"],
        [
            ["Executive Management", "Managing Director & CEO", "Strategic Vision, Partnerships & Corporate Governance"],
            ["Technology Division", "Chief Technology Officer (CTO)", "Architecture Roadmap, Tech Stack Selection & Quality Standards"],
            ["Engineering Division", "Lead Software Architect / Dev Lead", "Sprint Execution, Code Review & Backend/Frontend Delivery"],
            ["Product & UI/UX", "Product Manager & UI/UX Lead", "User Stories, Wireframing, Prototyping & Usability Testing"],
            ["Quality Assurance", "QA & Test Automation Lead", "Unit Testing, Integration Testing, Security Audits & UAT"],
            ["Internship Trainees", "Junior Software Developers (Interns)", "Module Implementation, Bug Fixing, API Integration & Docs"]
        ],
        [1.8, 2.2, 2.5]
    )

    add_heading_1("2.6 My Position in this Organization")
    add_body(
        "In this organization, I worked as a Junior Software Developer (Intern) in the Department of Software Development. My responsibilities included assisting in frontend and backend development for the “IUBAT Hostel Seat Management System”, implementing role-based authentication, designing database schemas, integrating seat allocation and room radar modules, developing meal token verification APIs, conducting software testing, and preparing technical documentation. I collaborated closely with senior software engineers, UI designers, and project supervisors during the entire development lifecycle. This internship provided me with invaluable practical experience in MERN stack web development, agile sprint practices, code debugging, and systematic problem-solving in a professional corporate environment."
    )

    add_heading_1("2.7 Address of the Organization")
    add_body(
        "Agnos Group LTD. Corporate Office\n"
        "House-12, Road-04, Sector-11, Uttara Model Town\n"
        "Dhaka-1230, Bangladesh.\n"
        "Phone: +880 1711 000000 | Email: info@agnosgroup.com | Web: https://www.agnosgroup.com"
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 3: REQUIREMENT ENGINEERING
    # =========================================================================
    add_chapter_divider("3", "Requirement Engineering")

    add_heading_1("3.1 Requirement Analysis")
    add_body(
        "Requirements for the “Development of IUBAT Hostel Seat Management System” involve a structured process to identify, analyze, specify, validate, and manage the user and system requirements. Through observation, discussions, and requirement collection from students, house tutors, provosts, dining staff, and university IT administrators, various system needs such as seat creation, room allocation, meal token booking, digital out-pass approvals, secure login, role-based access control, and financial ledger auditing were identified."
    )
    add_body(
        "The system requirements for administrators include room tariff management, supervisor assignment, student record governance, financial profit-and-loss reporting, and account suspension/deletion. Supervisor requirements include floor seat inspection, out-pass recommendation, and maintenance delegation. Student requirements include browsing live vacant seats across Padma Residential Hall, viewing room qualities, applying for seats, taking AI roommate compatibility tests, and purchasing meal tokens online. Requirement analysis ensured that the proposed system remains feasible, user-friendly, and aligned with the project objectives. The Incremental Process Model was used during development to gradually implement modules such as authentication, room vacancy radar, meal token management, and leave approval pipelines."
    )

    add_heading_1("3.2 Requirement Engineering")
    add_heading_2("3.2.1 User Requirements")
    add_body("For Student:", bold_prefix=None)
    add_bullet("Students must be able to register and log in securely using Student ID and institutional email.")
    add_bullet("Students should view real-time vacant beds across Padma Residential Hall (Floor 1 & Floor 2).")
    add_bullet("Students must be able to apply for available hostel seats (Single, Double, or 4-Bed Quad).")
    add_bullet("Students should complete the 7-question lifestyle questionnaire for AI roommate compatibility pairing.")
    add_bullet("Students must be able to purchase daily meal tokens (Breakfast, Lunch, Dinner) and view consumption history.")
    add_bullet("Students must be able to submit digital out-pass applications and track guardian and tutor approval status.")

    add_body("For Supervisor (House Tutor & Hostel Super):", bold_prefix=None)
    add_bullet("Supervisors must be able to log in securely to their designated floor/hostel console.")
    add_bullet("Supervisors should view assigned floor room layouts, student occupant details, and emergency contacts.")
    add_bullet("Supervisors must verify student leave requests with guardian SMS consent before endorsing approval.")
    add_bullet("Supervisors must inspect reported maintenance issues on-site and delegate work orders to staff.")

    add_body("For Admin (Super Administrator):", bold_prefix=None)
    add_bullet("Admins must have root administrative access to manage all system configurations.")
    add_bullet("Admins should configure room rent tariffs, create new rooms, and update occupancy statuses.")
    add_bullet("Admins must provision, suspend (block), reactivate, or permanently delete user accounts across all roles.")
    add_bullet("Admins should audit total revenues, dining expenses, utility costs, and net hostel profit/loss.")

    add_heading_2("3.2.2 System Requirements")
    add_body("For Admin:", bold_prefix=None)
    add_bullet("Admin login authentication with session validation.")
    add_bullet("CRUD operations on rooms, room types, and floor layouts.")
    add_bullet("CRUD operations on student, tutor, staff, and guardian profiles.")
    add_bullet("Dynamic ledger generation with income, expense vouchers, and monthly balance sheets.")

    add_body("For Supervisor:", bold_prefix=None)
    add_bullet("Manage assigned floor rooms (Padma Floor 1: Rooms 101-108; Padma Floor 2: Rooms 201-208).")
    add_bullet("Perform 10:00 PM digital night roll-call and record curfew compliance.")
    add_bullet("Sanction seat allocations and approve gate passes.")

    add_body("For Student:", bold_prefix=None)
    add_bullet("Register account with automatic allocation application submission.")
    add_bullet("Real-time room vacancy radar exploration.")
    add_bullet("Online payment of seat rent via SSLCommerz gateway.")

    add_heading_2("3.2.3 Functional Requirements")
    add_bullet("Allow users to register and log in securely with role-based dashboard redirection.")
    add_bullet("Authenticate users based on 6 roles (Student, Tutor, Super, Staff, Parent, Admin).")
    add_bullet("Maintain real-time bed-level occupancy state in the database.")
    add_bullet("Prevent duplicate room allocations and double seat bookings.")
    add_bullet("Compute AI compatibility vector scores for roommate pairing.")
    add_bullet("Generate downloadable, print-ready PDF payment receipts and gate passes.")

    add_heading_2("3.2.4 Non-Functional Requirements")
    add_bullet("Responsive Design: Fully responsive user interface supporting desktop, tablet, and mobile displays.")
    add_bullet("Performance: Fast API response time (< 150ms) for high concurrency.")
    add_bullet("Security: Bcrypt password hashing, session tokens, and input sanitization.")
    add_bullet("Reliability & Data Integrity: MongoDB / MySQL relational referential consistency.")
    add_bullet("Scalability: Modular layered architecture supporting future IoT lock integrations.")

    add_heading_2("3.2.5 Hardware Requirements")
    add_body("For Server:", bold_prefix=None)
    add_bullet("Processor: Intel Core i5 / AMD Ryzen 5 or higher (Cloud vCPU)")
    add_bullet("RAM: 8 GB minimum (16 GB recommended)")
    add_bullet("Storage: 256 GB SSD or higher")
    add_bullet("Network: High-speed stable internet connection")

    add_body("For Client:", bold_prefix=None)
    add_bullet("Processor: Intel Core i3 or equivalent mobile processor")
    add_bullet("RAM: 4 GB minimum")
    add_bullet("Display Resolution: 1280 x 720 or modern mobile smartphone display")

    add_heading_2("3.2.6 Software Requirements")
    add_bullet("Operating System: Windows 10/11 / macOS / Linux")
    add_bullet("Frontend Framework: React 18, Vite, Tailwind CSS, JavaScript")
    add_bullet("Backend Runtime: Node.js with Express.js REST Framework")
    add_bullet("Database: MongoDB Atlas / MySQL Relational Engine")
    add_bullet("IDE & Tools: Visual Studio Code, Postman, Git")

    add_heading_1("3.3 Use Case Diagram of the System")
    add_body(
        "Figure 3. 1 represents the standard Use Case symbols used, and Figure 3. 2 illustrates the complete Use Case Diagram for the IUBAT Hostel Seat Management System."
    )
    p_f31 = doc.add_paragraph()
    p_f31.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_f31.add_run("Figure 3. 1 Use Case Symbol Table Representation").bold = True
    p_f31.paragraph_format.space_after = Pt(4)

    p_f32 = doc.add_paragraph()
    p_f32.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_f32.add_run("Figure 3. 2 Use Case Diagram").bold = True
    p_f32.paragraph_format.space_after = Pt(4)

    add_body(
        "The Use Case Diagram models the core interactions across the primary actors: Admin (creates rooms, manages tariffs, provisions users, audits ledgers), Supervisor (allocates rooms, endorses out-passes, delegates repairs), Staff (validates meal tokens, executes repairs), and Student (applies for seat, purchases meals, logs complaints, pays rent)."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 4: ANALYSIS AND DESIGN
    # =========================================================================
    add_chapter_divider("4", "Analysis and Design")

    add_heading_1("4.1 Software Analysis Pattern")
    add_body(
        "For the development of the “IUBAT Hostel Seat Management System”, the Model–View–Controller (MVC) and Layered Architectural Pattern were selected. The MVC pattern separates the application into three interconnected components: Model, View, and Controller. This architectural approach improves maintainability, scalability, modularity, and system organization."
    )
    add_bullet("Model: Manages business data models (User, Room, Application, Meal, GatePass, Complaint, Payment) and database interactions with MongoDB / MySQL.")
    add_bullet("View: Represents the interactive user interface, designed with React 18, Tailwind CSS, and Lucide icons for responsive rendering.")
    add_bullet("Controller: Acts as an intermediary, processing incoming HTTP requests, applying validation logic, and orchestrating responses.")

    add_heading_2("4.1.1 Why This Pattern is Chosen")
    add_bullet("Separation of Concerns: Decouples UI presentation from backend business rules and database queries.")
    add_bullet("Scalability: Facilitates adding new features such as IoT smart meters or SMS gateways without restructuring core models.")
    add_bullet("Maintainability: Simplifies debugging and component isolation across independent sprints.")
    add_bullet("Reusability: Reusable controllers and React UI components reduce code duplication.")

    add_heading_1("4.2 Layered Architectural Approach")
    add_body("The system is organized into four distinct architectural layers:")
    add_bullet("4.2.1 Presentation Layer: React 18 SPA, responsive dashboards, modal overlays, and visual room vacancy grids.")
    add_bullet("4.2.2 Application / Business Logic Layer: Express REST API controllers handling room allocation logic, AI vector calculations, and meal token billing.")
    add_bullet("4.2.3 Data Access Layer: Mongoose ORM / Query builders executing sanitized CRUD transactions.")
    add_bullet("4.2.4 Database Layer: MongoDB Atlas / MySQL database storing normalized collections with secondary B-tree indexes.")

    add_heading_1("4.3 Why a Layered Architecture Was Used")
    add_bullet("Simplified Maintenance: Modifications in the presentation UI do not impact backend database schemas.")
    add_bullet("Improved Testability: Each layer can be tested independently through automated unit and integration test suites.")
    add_bullet("Enhanced Security: Protects database access behind secure controller middleware and JWT authentication.")

    add_heading_1("4.4 Activity Diagram of the System")
    add_body("The system's dynamic operational flows are modeled through sequential activity diagrams:")
    add_bullet("4.4.1 User Login Activity Diagram (Figure 4. 1): Illustrates credential submission, validation, role detection, and dashboard redirection.")
    add_bullet("4.4.2 Program & Room Management Supervisor Activity Diagram (Figure 4. 2): Shows tutor floor room inspection and seat status updating.")
    add_bullet("4.4.3 Supervisor Logistics Management (Figure 4. 3): Demonstrates repair delegation and maintenance material requisition.")
    add_bullet("4.4.4 Admin Event & Hostel Management (Figure 4. 4): Depicts room tariff modification, user provisioning, and financial ledger auditing.")
    add_bullet("4.4.5 Student Seat Registration & Payment (Figure 4. 5): Traces student room selection, AI questionnaire completion, SSLCommerz checkout, and receipt generation.")

    add_heading_1("4.5 Sequence Diagrams, Class Diagram & Swimlane Workflows")
    add_body("Structural and behavioral interactions are further detailed via:")
    add_bullet("Sequence Diagrams (Figures 4.6 to 4.10): Depicting object lifecycle interactions between Actor, UI, Controller, and Database.")
    add_bullet("Class Diagram (Figure 4.11): Displaying class attributes, methods, and relationships (Composition between Room and Bed; Association between Student and Application).")
    add_bullet("Swimlane Diagrams (Figures 4.12 to 4.16): Highlighting parallel stakeholder handoffs across Student, Guardian, Tutor, Provost, Staff, and Admin partitions.")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 5: PROJECT MANAGEMENT
    # =========================================================================
    add_chapter_divider("5", "Project Management")

    add_heading_1("5.1 Project Management")
    add_body(
        "Project management ensures that the development of the “IUBAT Hostel Seat Management System” is completed systematically within planned timelines and resource constraints. The project management lifecycle encompassed requirement gathering, sprint planning, development, unit testing, security audits, and deployment."
    )

    add_heading_1("5.2 Risk Identification")
    add_body("Risks were systematically identified and categorized into technical, schedule, security, and operational risks:")
    
    p_t51 = doc.add_paragraph()
    p_t51.add_run("Table 5. 1 Risk Identification Table").bold = True
    p_t51.paragraph_format.space_after = Pt(4)

    add_table_custom(
        ["Risk ID", "Risk Description", "Risk Category"],
        [
            ["R1", "Unclear or changing hostel room tariff requirements", "Requirement Risk"],
            ["R2", "Compatibility issues across third-party payment gateways (SSLCommerz)", "Technical Risk"],
            ["R3", "Concurrency bottlenecks during peak semester seat intake", "Technical Risk"],
            ["R4", "Tight internship development schedule affecting delivery", "Schedule Risk"],
            ["R5", "Unauthorized access to student out-pass or financial records", "Security Risk"],
            ["R6", "Slow database response times during mass meal token validations", "Performance Risk"],
            ["R7", "Difficulties in coordinating multi-tier stakeholder approvals", "Management Risk"],
            ["R8", "Errors during module integration and state synchronization", "Development Risk"]
        ],
        [1.0, 4.0, 1.5]
    )

    add_heading_1("5.3 Risk Analysis & Planning")
    p_t52 = doc.add_paragraph()
    p_t52.add_run("Table 5. 2 Risk Analysis Table").bold = True
    p_t52.paragraph_format.space_after = Pt(4)

    add_table_custom(
        ["Risk ID", "Probability", "Impact", "Risk Level"],
        [
            ["R1", "Medium", "High", "High"],
            ["R2", "Medium", "Medium", "Medium"],
            ["R3", "Medium", "High", "High"],
            ["R4", "High", "High", "High"],
            ["R5", "Medium", "High", "High"],
            ["R6", "Low", "Medium", "Low"],
            ["R7", "Medium", "Medium", "Medium"],
            ["R8", "Medium", "Medium", "Medium"]
        ],
        [1.2, 1.5, 1.5, 1.5]
    )

    add_heading_1("5.4 Risk Planning & The RMMM Plan")
    p_t53 = doc.add_paragraph()
    p_t53.add_run("Table 5. 3 Risk Planning Table").bold = True
    p_t53.paragraph_format.space_after = Pt(4)

    add_table_custom(
        ["Risk ID", "Risk Mitigation Strategy"],
        [
            ["R1", "Conduct regular requirement reviews with House Tutors and Provost Office."],
            ["R2", "Use sandbox testing environments and robust SSLCommerz IPN webhook verifications."],
            ["R3", "Implement database indexing on roomId, studentId, and applicationRef fields."],
            ["R4", "Adopt Agile sprints and prioritize essential core modules first."],
            ["R5", "Enforce strict JWT token authentication, Bcrypt hashing, and role middleware."],
            ["R6", "Optimize aggregation queries and implement client-side cache state."],
            ["R7", "Maintain clear documentation and sprint tracking at Agnos Group LTD."],
            ["R8", "Perform continuous module-wise integration testing before deployment."]
        ],
        [1.2, 5.3]
    )

    add_heading_1("5.5 The RMMM Plan (Risk Mitigation, Monitoring, and Management)")
    add_bullet("5.5.1 Risk Mitigation: Implementing preventive software design patterns, normalized database models, and input validation schemas.")
    add_bullet("5.5.2 Risk Monitoring: Tracking sprint velocity, code coverage, error logs, and API latency.")
    add_bullet("5.5.3 Risk Management: Executing contingency rollbacks and schedule adjustments if integration bottlenecks arise.")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 6: PROJECT PLANNING AND SCHEDULING
    # =========================================================================
    add_chapter_divider("6", "Project Planning and Scheduling")

    add_heading_1("6.1 Project Planning and Scheduling")
    add_body(
        "Project planning and scheduling ensure that the “IUBAT Hostel Seat Management System” is developed within planned time, resource, and budget constraints. The project timeline spanned 80 working days (approximately 3 months) during the internship at Agnos Group LTD."
    )

    add_heading_1("6.2 System Project Estimation")
    p_t61 = doc.add_paragraph()
    p_t61.add_run("Table 6. 1 Transaction Functions").bold = True
    p_t61.paragraph_format.space_after = Pt(4)

    add_table_custom(
        ["Module Name", "Description", "Estimated Time (Hours)"],
        [
            ["User Authentication & Roles", "Secure login and 6-role RBAC access management", "18"],
            ["Room & Seat Management", "Create, update, delete, and view live room vacancies", "30"],
            ["AI Roommate Vector Engine", "Questionnaire scoring and cosine similarity matching", "25"],
            ["Seat Application & Registration", "Student application handling and allocation logic", "22"],
            ["Meal Token & Dining Module", "Token booking, dining staff verification, and billing", "20"],
            ["Digital Leave Pass Pipeline", "Guardian SMS consent, tutor verification, and gate pass", "20"],
            ["Financial Ledger & SSLCommerz", "Rent invoicing, payment gateway, and P&L ledger", "25"],
            Total := ["Total Estimated Time", "Comprehensive Full-Stack Development", "160 Hours"]
        ],
        [2.2, 3.3, 1.5]
    )

    add_heading_1("6.3 Functional-Oriented Metrics & Complexity")
    add_body("Functional metrics evaluate software complexity based on user-visible capabilities:")
    add_bullet("External Inputs (EI): 15 FP (Login, Seat Application, Lifestyle Input, Leave Request, Meal Booking, Payment).")
    add_bullet("External Outputs (EO): 5 FP (Digital Receipts, Gate Passes, Occupancy Summary, P&L Balance Sheets).")
    add_bullet("External Inquiries (EQ): 7 FP (Room Vacancy Search, Leave Status Check, Resident Profile Inquiries).")
    add_bullet("Internal Logical Files (ILF): 38 FP (Users, Rooms, Applications, Meals, GatePasses, Payments).")
    add_bullet("External Interface Files (EIF): 3 FP (SSLCommerz Gateway API, SMS Gateway).")

    add_body(
        "Total Unadjusted Function Points (UFP) = 27 (Transactions) + 41 (Data Functions) = 68 FP.\n"
        "Technical Complexity Factor (TCF) = 0.65 + (0.01 x 28) = 0.93.\n"
        "Adjusted Function Points (AFP) = 68 x 0.93 = 63.24 ≈ 63 FP.\n"
        "Total Estimated Effort = 63 x 10 = 630 Person-Hours."
    )

    add_heading_1("6.8 Project Schedule Chart")
    p_t64 = doc.add_paragraph()
    p_t64.add_run("Table 6. 4 Project Schedule Chart").bold = True
    p_t64.paragraph_format.space_after = Pt(4)

    add_table_custom(
        ["Phase", "Task Description", "Duration (Days)"],
        [
            ["Planning", "Define scope, requirements, and stakeholder analysis", "5"],
            ["Analysis", "Requirement specification and feasibility study", "6"],
            ["System Design", "ERD, UML diagrams, database schemas, and UI wireframes", "8"],
            ["Backend Development", "REST API routes, controllers, and authentication", "20"],
            ["Frontend Development", "React UI, Tailwind styling, room radar matrix", "15"],
            ["System Integration", "Frontend-backend API binding and payment integration", "6"],
            ["Testing & QA", "Unit testing, integration debugging, and security audits", "8"],
            ["Deployment", "Cloud hosting, MongoDB configuration, and verification", "4"],
            ["Documentation", "Final practicum report writing and supervisor review", "8"],
            ["Total Duration", "Full Project Lifecycle", "80 Days (~3 Months)"]
        ],
        [1.8, 3.5, 1.5]
    )

    add_heading_1("6.9 Project Cost Estimation")
    p_t65 = doc.add_paragraph()
    p_t65.add_run("Table 6. 5 Project Cost Estimation Summary").bold = True
    p_t65.paragraph_format.space_after = Pt(4)

    add_table_custom(
        ["Cost Category", "Description", "Cost (Tk)"],
        [
            ["Personnel Cost", "Developer (Self) system design, development, and testing", "20,000"],
            ["Testing & QA Support", "Assistance in QA validation and security checks", "3,000"],
            ["Hardware & Internet", "Development workstation, high-speed broadband, and backup", "4,500"],
            ["Software Licensing", "Open-source MERN stack, VS Code, Git, and MongoDB Atlas", "0"],
            ["Utilities & Printing", "Power consumption during development, report binding", "3,200"],
            ["Total Estimated Cost", "Complete Software Development Investment", "30,700 Tk"]
        ],
        [2.0, 3.5, 1.5]
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 7: INTERFACE DESIGN & DATABASE DESIGN
    # =========================================================================
    add_chapter_divider("7", "Interface Design")

    add_heading_1("7.1 Interface Design")
    add_body(
        "The interface of the “IUBAT Hostel Seat Management System” is designed with a modern SaaS aesthetic, clean typography, responsive layout grids, and full dark/light theme support. It features:"
    )
    add_bullet("7.1.1 Landing & About Us: Highlights key hostel amenities, safety protocols, and room qualities.")
    add_bullet("7.1.2 Seat Vacancy Radar: Live interactive display of vacant vs. occupied beds in Padma Residential Hall.")
    add_bullet("7.1.3 Student Registration & 1-Click Fast Login: Modal authentication with role switching and pre-filled demo accounts.")
    add_bullet("7.1.4 Public Announcements & Notices: Campus bulletins for dining menus, curfew timings, and inspection notices.")

    add_heading_1("7.2 Admin User Interfaces")
    add_bullet("7.2.1 Admin Dashboard: Top-level KPIs showing 85.0% occupancy (34/40 beds), financial revenue tiles, and room quality counts.")
    add_bullet("7.2.2 Room Tariff & Quality Manager: Controls pricing for Single (৳5,500), Double (৳3,500), and Quad (৳2,500) rooms.")
    add_bullet("7.2.3 User Governance Console: Allows provision, block/suspend, reactivate, or permanently delete accounts across all roles.")
    add_bullet("7.2.4 Executive Financial P&L Ledger: Real-time calculation of seat rent collections, dining bazaar expenses, utility bills, and net profit.")

    add_heading_1("7.3 Student User Interfaces")
    add_bullet("7.3.1 Resident Dashboard: Displays allocated room slot (e.g. Padma Hall, Floor 1, Room 104, Bed B) and house tutor direct contact.")
    add_bullet("7.3.2 AI Roommate Compatibility: Questionnaire interface showing compatibility percentages and shared living habits.")
    add_bullet("7.3.3 Meal Booking & Token Manager: Calendar-based booking for daily meals and consumption tracking.")
    add_bullet("7.3.4 Digital Out-Pass & Payment: Online submission of leave requests and SSLCommerz invoice settlement.")

    add_heading_1("7.4 Supervisor (House Tutor & Provost) Interfaces")
    add_bullet("7.4.1 Tutor Floor Console: Dedicated view for Floor 1 (Rooms 101-108) and Floor 2 (Rooms 201-208) room inspections.")
    add_bullet("7.4.2 10:00 PM Night Roll-Call: Quick student attendance marking and curfew compliance logging.")
    add_bullet("7.4.3 Out-Pass Endorsement: Verification of guardian digital consent and issuance of gate passes.")
    add_bullet("7.4.4 Work Order Delegation: Maintenance ticket assignment to staff with priority escalation.")

    add_heading_1("7.5 Database Design")
    add_body(
        "The system's database schema is structured into normalized collections / tables:"
    )
    add_bullet("7.5.1 Admin Table: Administrative credentials, executive authorization level, and audit logs.")
    add_bullet("7.5.2 Room Table: Room number (101-108, 201-208), floor, capacity, room quality type, and occupant list.")
    add_bullet("7.5.3 Orders / Payment Table: Transaction ID, invoice amount, student ID, payment gateway method, and status.")
    add_bullet("7.5.4 Meal Table: Daily meal date, meal type, student ID, token cost, and dining staff approval timestamp.")
    add_bullet("7.5.5 Application Table: Seat application reference, student academic details, lifestyle vector scores, and allocation status.")
    add_bullet("7.5.6 Student Table: Student ID, institutional email, phone number, CGPA, guardian details, and room slot.")
    add_bullet("7.5.7 Supervisor Table: House tutor / provost ID, assigned floor, contact number, and approval logs.")

    add_heading_1("7.6 Data Flow Diagrams (DFD) & 7.7 Entity Relationship Diagram (ERD)")
    add_bullet("DFD Level-0 (Context Diagram): Overall data flow between Student, Supervisor, Staff, Admin, and the Hostel System.")
    add_bullet("DFD Level-1: Decomposition into Authentication, Room Allocation, Meal Management, Leave Pipeline, and Financial Ledger.")
    add_bullet("DFD Level-2: Detailed operational subprocesses for seat verification, invoice callback, and gate pass generation.")
    add_bullet("Entity Relationship Diagram (ERD): Complete relational model demonstrating foreign keys, primary keys, and cardinality.")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 8: SYSTEM QUALITY AND TESTING
    # =========================================================================
    add_chapter_divider("8", "System Quality and Testing")

    add_heading_1("8.1 Software Quality Management Process")
    add_body(
        "The following activities were implemented to ensure the quality of the “IUBAT Hostel Seat Management System”:"
    )
    add_bullet("Requirement Verification: All functional and non-functional requirements such as room allocation logic, meal validation, and out-pass pipelines were thoroughly validated.")
    add_bullet("Code Quality Control: Clean, structured, modular code adhering to React best practices, Express middleware standards, and REST conventions.")
    add_bullet("Testing Activities: Unit testing, integration testing, and User Acceptance Testing (UAT) conducted on core modules.")
    add_bullet("Issue Management: Identified bugs and state synchronization errors were documented and resolved systematically.")

    add_heading_1("8.2 Software Test Cases")
    add_body("Sample test cases executed during system quality evaluation:")

    p_t81 = doc.add_paragraph()
    p_t81.add_run("Table 8. 1 User Login Test Case (Admin/Student/Supervisor)").bold = True
    p_t81.paragraph_format.space_after = Pt(4)

    add_table_custom(
        ["Step", "Test Steps", "Test Data", "Expected Result", "Status"],
        [
            ["1", "Open login modal", "N/A", "Login modal renders correctly", "Pass"],
            ["2", "Enter Email / ID", "student.cse@iubat.edu / 221004128", "Input accepted", "Pass"],
            ["3", "Enter Password", "123456", "Masked password accepted", "Pass"],
            ["4", "Click Login", "N/A", "Redirects to role dashboard", "Pass"],
            ["5", "Check Role Access", "Role: Student", "Student dashboard shown", "Pass"]
        ],
        [0.8, 1.8, 1.8, 1.8, 0.8]
    )

    p_t82 = doc.add_paragraph()
    p_t82.add_run("Table 8. 2 Room Allocation Test Case (Supervisor/Admin)").bold = True
    p_t82.paragraph_format.space_after = Pt(4)

    add_table_custom(
        ["Step", "Test Steps", "Test Data", "Expected Result", "Status"],
        [
            ["1", "Go to allocation console", "N/A", "Pending student applications listed", "Pass"],
            ["2", "Select room and bed", "Padma Room 104, Bed B", "Slot highlighted as available", "Pass"],
            ["3", "Click Sanction Allocation", "Student ID: 221004128", "Bed assigned, occupancy updated", "Pass"],
            ["4", "Verify Student View", "N/A", "Student dashboard displays Room 104", "Pass"]
        ],
        [0.8, 1.8, 1.8, 1.8, 0.8]
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 9: ETHICAL CONSIDERATION
    # =========================================================================
    add_chapter_divider("9", "Ethical Consideration")

    add_heading_1("9.1 Ethical Considerations in the Software Development Process")
    add_body(
        "The “IUBAT Hostel Seat Management System” was developed by following ethical software engineering principles to ensure privacy, security, fairness, and responsibility toward all users including Admin, Supervisor, Staff, Parents, and Students."
    )
    add_bullet("9.1.1 Data Privacy and Security: Student personal data, guardian phone numbers, and payment details are encrypted. Bcrypt hashing protects user passwords.")
    add_bullet("9.1.2 Intellectual Property: All system design, code, and database structures are originally developed; open-source libraries are used under MIT licenses.")
    add_bullet("9.1.3 User Impact: Streamlines administrative processes, providing students and tutors with transparent, stress-free residential management.")
    add_bullet("9.1.4 Bias and Fairness: Room allocations follow transparent merit criteria and objective AI lifestyle compatibility scores without human bias.")
    add_bullet("9.1.5 Responsibility to Stakeholders: Provides guardians with real-time out-pass transparency and ensures provost executive accountability.")
    add_bullet("9.1.6 Professional Responsibility: Maintained high coding standards, comprehensive test coverage, and clear documentation.")

    add_heading_1("9.2 Sustainability in the Software Development Process")
    add_bullet("9.2.1 Economic Sustainability: Utilizes lightweight open-source technologies, eliminating paper printing costs and reducing university administrative overhead.")
    add_bullet("9.2.2 Social Sustainability: Fosters a harmonious, safe residential environment through verified roommate pairing and digital guardian consent.")

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 10: CONCLUSION
    # =========================================================================
    add_chapter_divider("10", "Conclusion")

    add_heading_1("10.1 Brief Overview of the Project")
    add_body(
        "The “IUBAT Hostel Seat Management System” is a centralized web-based application designed to simplify and automate the management of university residential hall seats, room allocations, meal booking, digital out-passes, and multi-tier governance for IUBAT under the mentorship of Agnos Group LTD. By digitizing hostel operations, the system eliminates manual paperwork, improves coordination, and provides a smooth, user-friendly experience for all users."
    )

    add_heading_1("10.2 Proposed System Benefits")
    add_bullet("Admin: Centralized governance of room tariffs, user permissions, and financial profit-and-loss ledgers.")
    add_bullet("Supervisor (Tutors & Provost): Real-time occupancy tracking, 10 PM night roll-call, and verified out-pass endorsement.")
    add_bullet("Staff: Accurate daily meal token verification and organized room maintenance execution.")
    add_bullet("Students: Instant seat application, AI roommate compatibility pairing, digital payments, and transparent out-pass tracking.")
    add_bullet("University Management: Significant reduction in administrative labor, zero paper waste, and 100% financial accountability.")

    add_heading_1("10.3 Limitations of the Project")
    add_bullet("The current deployment is focused on web browsers and does not yet feature a native mobile app.")
    add_bullet("Hardware-based IoT smart door lock integration is not included in the initial release.")
    add_bullet("Biometric fingerprint / face recognition at the security gate is planned for future phases.")

    add_heading_1("10.4 Practicum and Its Value")
    add_body(
        "The practicum at Agnos Group LTD. provided valuable hands-on experience in applying theoretical software engineering principles to real-world institutional problems. It deepened my technical understanding of full-stack web architectures, database optimization, asynchronous API design, and security modeling. It also enhanced my professional skills in problem-solving, time management, technical documentation, and collaborative engineering."
    )

    add_heading_1("10.5 Future Plans")
    add_bullet("Mobile App Development: Building dedicated React Native mobile apps for students and tutors.")
    add_bullet("IoT Smart Door Integration: Connecting room door locks with digital QR/RFID gate passes.")
    add_bullet("Smart Metering: Integrating IoT power meters for room-level electricity consumption tracking.")
    add_bullet("Advanced Machine Learning: Enhancing roommate pairing with behavioral reinforcement models.")

    doc.add_page_break()

    # =========================================================================
    # REFERENCES (20+ CITATIONS)
    # =========================================================================
    add_title("References", size=16, space_after=18)

    references_list = [
        "Pressman, R. S., & Maxim, B. R. (2019). Software engineering: A practitioner’s approach (9th ed.). McGraw-Hill Education.",
        "Sommerville, I. (2016). Software engineering (10th ed.). Pearson.",
        "Dennis, A., Wixom, B. H., & Roth, R. M. (2019). Systems analysis and design (7th ed.). Wiley.",
        "Elmasri, R., & Navathe, S. B. (2016). Fundamentals of database systems (7th ed.). Pearson.",
        "Silberschatz, A., Korth, H. F., & Sudarshan, S. (2019). Database system concepts (7th ed.). McGraw-Hill.",
        "Welling, L., & Thomson, L. (2017). PHP and MySQL web development (5th ed.). Addison-Wesley.",
        "Duckett, J. (2014). PHP & MySQL: Server-side web development. Wiley.",
        "Duckett, J. (2011). HTML and CSS: Design and build websites. Wiley.",
        "Freeman, E., & Robson, E. (2014). Head first design patterns. O’Reilly Media.",
        "Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). Design patterns: Elements of reusable object-oriented software. Addison-Wesley.",
        "Fielding, R. T. (2000). Architectural styles and the design of network-based software architectures (Doctoral dissertation, University of California, Irvine).",
        "Fowler, M. (2002). Patterns of enterprise application architecture. Addison-Wesley.",
        "Date, C. J. (2019). An introduction to database systems (8th ed.). Pearson.",
        "Hoffer, J. A., George, J. F., & Valacich, J. S. (2016). Modern systems analysis and design (8th ed.). Pearson.",
        "Kendall, K. E., & Kendall, J. E. (2019). Systems analysis and design (10th ed.). Pearson.",
        "Chaffey, D. (2015). Digital business and e-commerce management (6th ed.). Pearson.",
        "Laudon, K. C., & Laudon, J. P. (2020). Management information systems: Managing the digital firm (16th ed.). Pearson.",
        "Oracle. (2024). Database design guidelines. https://www.oracle.com/database/",
        "Mozilla Developer Network. (2024). Web security guidelines. https://developer.mozilla.org/en-US/docs/Web/Security",
        "Google Developers. (2024). Web fundamentals. https://developers.google.com/web"
    ]

    for idx, ref in enumerate(references_list, 1):
        p_ref = doc.add_paragraph()
        p_ref.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_ref.paragraph_format.line_spacing = 1.15
        p_ref.paragraph_format.space_after = Pt(6)
        p_ref.paragraph_format.left_indent = Inches(0.4)
        p_ref.paragraph_format.first_line_indent = Inches(-0.4)
        p_ref.add_run(f"{idx}. {ref}")

    out_file = "/Users/parvez/Desktop/prroject/IUBAT_Hostel_Seat_Management_System_Practicum_Report.docx"
    doc.save(out_file)
    print(f"✅ Full 10-Chapter Report Generated at: {out_file}")

if __name__ == "__main__":
    generate_10_chapter_practicum_report()
