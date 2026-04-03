from enum import Enum

class PriorityEnum(str, Enum):
    P1 = "P1"
    P2 = "P2"
    P3 = "P3"

class FrequencyEnum(str, Enum):
    DAILY = "DAILY"
    WEEKLY = "WEEKLY"
    MONTHLY = "MONTHLY"
    ONE_TIME = "ONE_TIME"

class JobTypeEnum(str, Enum):
    JT1 = "JT1"  # e.g., Sand Delivery
    JT2 = "JT2"  # e.g., Water Supply
    JT3 = "JT3"  # Additional job types can be added

class LocationTypeEnum(str, Enum):
    LT1 = "LT1"
    LT2 = "LT2"

class VendorEnum(str, Enum):
    V1 = "V1"
    V2 = "V2"
    V3 = "V3"
    V4 = "V4"
    V5 = "V5"