from enum import Enum

class PriorityEnum(Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class StatusEnum(Enum):
    CREATED = "CREATED"
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"
    CLOSED = "CLOSED"
    APPROVED = "APPROVED"

class FrequencyEnum(Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"
    ONE_TIME = "ONE_TIME"


class LocationTypeEnum(Enum):
    WELL = "WELL"
    GPS = "GPS"
    ADDRESS = "ADDRESS"