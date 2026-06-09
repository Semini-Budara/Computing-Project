from app.db.database import SessionLocal
from app.models.enrollment import Enrollment
from app.models.subject import Subject
from app.models.student import Student
from sqlalchemy.orm import joinedload

session = SessionLocal()
student = session.query(Student).first()
print('student', student.id if student else None)
if student:
    enrolls = (
        session.query(Enrollment)
        .options(joinedload(Enrollment.subject).joinedload(Subject.timetables))
        .filter(Enrollment.student_id == student.id, Enrollment.status == 'approved')
        .all()
    )
    print('approved enrollments', len(enrolls))
    for en in enrolls:
        print('enrollment', en.id, en.status, en.subject and en.subject.name, 'timetables', len(en.subject.timetables) if en.subject else None)
        for tt in (en.subject.timetables if en.subject else []):
            print('  tt', tt.id, tt.day, tt.start_time, tt.end_time, tt.classroom)
session.close()
