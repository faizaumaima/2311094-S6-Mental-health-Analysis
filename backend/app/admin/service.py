from sqlmodel import Session

from app.admin.models import AuditLog


def create_audit_log(
    session: Session,
    actor_user_id: int,
    action: str,
    target_user_id: int | None = None,
    details: str | None = None,
) -> None:
    log = AuditLog(
        actor_user_id=actor_user_id,
        action=action,
        target_user_id=target_user_id,
        details=details,
    )

    session.add(log)
    session.commit()