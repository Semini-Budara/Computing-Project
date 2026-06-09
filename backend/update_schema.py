from app.db.database import engine
from sqlalchemy import text

def column_exists(conn, table_name, column_name):
    result = conn.execute(text(f"""
        SELECT COUNT(*) 
        FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = '{table_name}' 
        AND column_name = '{column_name}'
    """))
    return result.scalar() > 0


def table_exists(conn, table_name):
    result = conn.execute(text(f"""
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = DATABASE()
        AND table_name = '{table_name}'
    """))
    return result.scalar() > 0

# Add missing columns to subjects table
with engine.connect() as conn:
    # Get database name
    db_result = conn.execute(text("SELECT DATABASE()"))
    db_name = db_result.scalar()
    
    if not column_exists(conn, 'subjects', 'monthly_fee'):
        conn.execute(text("ALTER TABLE subjects ADD COLUMN monthly_fee FLOAT"))
        print("Added monthly_fee column to subjects table")
    else:
        print("monthly_fee column already exists in subjects table")

    if not column_exists(conn, 'subjects', 'schedule_time'):
        conn.execute(text("ALTER TABLE subjects ADD COLUMN schedule_time VARCHAR(255)"))
        print("Added schedule_time column to subjects table")
    else:
        print("schedule_time column already exists in subjects table")

    if not column_exists(conn, 'teachers', 'profile_image'):
        conn.execute(text("ALTER TABLE teachers ADD COLUMN profile_image TEXT"))
        print("Added profile_image column to teachers table")
    else:
        print("profile_image column already exists in teachers table")

    if not column_exists(conn, 'teachers', 'qualifications'):
        conn.execute(text("ALTER TABLE teachers ADD COLUMN qualifications TEXT"))
        print("Added qualifications column to teachers table")
    else:
        print("qualifications column already exists in teachers table")

    if not column_exists(conn, 'teachers', 'experience'):
        conn.execute(text("ALTER TABLE teachers ADD COLUMN experience TEXT"))
        print("Added experience column to teachers table")
    else:
        print("experience column already exists in teachers table")

    if not column_exists(conn, 'teachers', 'subjects_taught'):
        conn.execute(text("ALTER TABLE teachers ADD COLUMN subjects_taught TEXT"))
        print("Added subjects_taught column to teachers table")
    else:
        print("subjects_taught column already exists in teachers table")

    if not column_exists(conn, 'teachers', 'class_fee'):
        conn.execute(text("ALTER TABLE teachers ADD COLUMN class_fee VARCHAR(50)"))
        print("Added class_fee column to teachers table")
    else:
        print("class_fee column already exists in teachers table")

    if not column_exists(conn, 'teachers', 'contact_number'):
        conn.execute(text("ALTER TABLE teachers ADD COLUMN contact_number VARCHAR(50)"))
        print("Added contact_number column to teachers table")
    else:
        print("contact_number column already exists in teachers table")

    if not column_exists(conn, 'students', 'teacher_id'):
        conn.execute(text("ALTER TABLE students ADD COLUMN teacher_id INT"))
        conn.execute(text("ALTER TABLE students ADD CONSTRAINT fk_students_teacher FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE SET NULL"))
        print("Added teacher_id column to students table")
    else:
        print("teacher_id column already exists in students table")

    if not table_exists(conn, 'student_teachers'):
        conn.execute(text(
            "CREATE TABLE student_teachers ("
            "student_id INT NOT NULL, "
            "teacher_id INT NOT NULL, "
            "PRIMARY KEY (student_id, teacher_id), "
            "FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE, "
            "FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE"
            ")"
        ))
        print("Created student_teachers association table")
    else:
        print("student_teachers table already exists")

    if not column_exists(conn, 'enrollments', 'term1_result'):
        conn.execute(text("ALTER TABLE enrollments ADD COLUMN term1_result VARCHAR(50)"))
        print("Added term1_result column to enrollments table")
    else:
        print("term1_result column already exists in enrollments table")

    if not column_exists(conn, 'enrollments', 'term2_result'):
        conn.execute(text("ALTER TABLE enrollments ADD COLUMN term2_result VARCHAR(50)"))
        print("Added term2_result column to enrollments table")
    else:
        print("term2_result column already exists in enrollments table")

    if not column_exists(conn, 'enrollments', 'term3_result'):
        conn.execute(text("ALTER TABLE enrollments ADD COLUMN term3_result VARCHAR(50)"))
        print("Added term3_result column to enrollments table")
    else:
        print("term3_result column already exists in enrollments table")

    conn.commit()
    print("Database schema updated successfully")