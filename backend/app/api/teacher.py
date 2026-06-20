from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.api.deps import get_current_teacher, get_db, get_current_active_teacher
from app.crud.notification import (
    list_notifications_by_teacher,
    get_notification_for_teacher,
    dismiss_notification_for_user,
    clear_notifications_for_user,
)
from app.crud.subject import get_subject, list_subjects
from app.crud.teacher import get_teacher_by_user_id
from app.crud.timetable import list_timetable_for_subject
from app.models.enrollment import Enrollment
from app.models.subject import Subject
from app.models.student import Student
from app.schemas.user import UserRead
from app.schemas.profile import TeacherProfile
from app.schemas.notification import NotificationRead
from app.schemas.timetable import TimetableRead
from app.schemas.subject import SubjectRead

router = APIRouter(prefix="/teachers", tags=["teachers"])


@router.get("/me/profile", response_model=TeacherProfile)
def read_teacher_profile(
    current_user=Depends(get_current_active_teacher),
    db: Session = Depends(get_db),
):
    teacher = get_teacher_by_user_id(db, current_user.id)
    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher profile not found")
    return {"user": UserRead.from_orm(current_user), "teacher": teacher}


@router.get("/me/notifications", response_model=list[NotificationRead])
def read_notifications(
    current_teacher=Depends(get_current_teacher),
    current_user=Depends(get_current_active_teacher),
    db: Session = Depends(get_db),
):
    return list_notifications_by_teacher(db, current_teacher.id, current_user.id)


@router.delete("/me/notifications/{notification_id}")
def dismiss_notification(
    notification_id: int,
    current_teacher=Depends(get_current_teacher),
    current_user=Depends(get_current_active_teacher),
    db: Session = Depends(get_db),
):
    notification = get_notification_for_teacher(db, notification_id, current_teacher.id)
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    dismiss_notification_for_user(db, notification_id, current_user.id)
    return {"detail": "Notification dismissed"}


@router.delete("/me/notifications")
def clear_notifications(current_user=Depends(get_current_active_teacher), db: Session = Depends(get_db)):
    clear_notifications_for_user(db, current_user.id)
    return {"detail": "All notifications dismissed"}


@router.get("/me/timetable", response_model=List[TimetableRead])
def read_timetable(current_teacher=Depends(get_current_teacher), db: Session = Depends(get_db)):
    subjects = (
        db.query(Subject)
        .options(joinedload(Subject.timetables))
        .filter(Subject.teacher_id == current_teacher.id)
        .all()
    )
    records = []
    for subject in subjects:
        records.extend(subject.timetables)
    return records


@router.get("/me/classes", response_model=list[SubjectRead])
def read_teacher_classes(current_teacher=Depends(get_current_teacher), db: Session = Depends(get_db)):
    return db.query(Subject).filter(Subject.teacher_id == current_teacher.id).all()


@router.get("/me/students")
def read_teacher_students(current_teacher=Depends(get_current_teacher), db: Session = Depends(get_db)):
    # Get all students enrolled in the teacher's subjects
    enrollments = (
        db.query(Enrollment)
        .join(Subject)
        .filter(Subject.teacher_id == current_teacher.id)
        .all()
    )
    
    # Get unique students
    seen_students = set()
    students = []
    for enrollment in enrollments:
        student = enrollment.student
        if student.id not in seen_students:
            seen_students.add(student.id)
            students.append({
                "id": student.id,
                "username": student.user.username,
                "email": student.user.email,
                "full_name": student.user.full_name,
                "grade": student.grade,
                "school": student.school,
                "guardian_name": student.guardian_name,
                "guardian_contact": student.guardian_contact,
            })
    
    return students


@router.get("/me/students/results")
def read_students_results(current_teacher=Depends(get_current_teacher), db: Session = Depends(get_db)):
    # Get all enrollments for students in the teacher's subjects
    enrollments = (
        db.query(Enrollment)
        .join(Subject)
        .filter(Subject.teacher_id == current_teacher.id)
        .all()
    )
    
    # Group by student and include results
    results = {}
    for enrollment in enrollments:
        student_id = enrollment.student_id
        if student_id not in results:
            results[student_id] = {
                "student_id": student_id,
                "student_name": enrollment.student.user.full_name,
                "grade": enrollment.grade,
                "subjects": []
            }
        results[student_id]["subjects"].append({
            "subject_id": enrollment.subject_id,
            "subject_name": enrollment.subject.name,
            "term1_result": enrollment.term1_result,
            "term2_result": enrollment.term2_result,
            "term3_result": enrollment.term3_result,
        })
    
    return list(results.values())


@router.put("/me/students/{student_id}/results")
def update_student_results(
    student_id: int,
    results: dict,  # e.g., {"term1": "A", "term2": "B+", "term3": "A-"}
    current_teacher=Depends(get_current_teacher),
    db: Session = Depends(get_db),
):
    # Find enrollments for this student in the teacher's subjects
    enrollments = (
        db.query(Enrollment)
        .join(Subject)
        .filter(
            Enrollment.student_id == student_id,
            Subject.teacher_id == current_teacher.id,
            Enrollment.status == "approved"
        )
        .all()
    )
    if not enrollments:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No enrollments found for this student")

    # Update each enrollment with the results
    for enrollment in enrollments:
        if "term1" in results:
            enrollment.term1_result = results["term1"]
        if "term2" in results:
            enrollment.term2_result = results["term2"]
        if "term3" in results:
            enrollment.term3_result = results["term3"]

    db.commit()
    return {"detail": "Results updated successfully"}


@router.get("/subjects", response_model=list[SubjectRead])
def read_subjects(current_teacher=Depends(get_current_teacher), db: Session = Depends(get_db)):
    return db.query(Subject).filter(Subject.teacher_id == current_teacher.id).all()
