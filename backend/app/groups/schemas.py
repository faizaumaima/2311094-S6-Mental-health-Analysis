from pydantic import BaseModel, EmailStr, Field


class GroupIn(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class GroupRename(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class MemberIn(BaseModel):
    email: EmailStr
    can_create: bool = False
    can_edit: bool = False
    can_assign: bool = False


class PermissionsIn(BaseModel):
    can_create: bool
    can_edit: bool
    can_assign: bool


class AssignIn(BaseModel):
    assigned_to: int
