from bson import ObjectId
from datetime import datetime, date

def serialize_value(value):
    if isinstance(value, ObjectId):
        return str(value)

    if isinstance(value, datetime):
        return value.isoformat()

    if isinstance(value, date):
        return value.isoformat()

    if isinstance(value, list):
        return [serialize_value(v) for v in value]

    if isinstance(value, dict):
        return {k: serialize_value(v) for k, v in value.items()}

    return value


def serialize_doc(doc: dict):
    return serialize_value(doc)
