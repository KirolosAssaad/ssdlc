from functools import wraps
from flask import request, jsonify
from marshmallow import ValidationError
from app.utils.responses import error_response

def validate_json(schema):
    """
    Decorator to validate JSON request data against a Marshmallow schema
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                # Check if request has JSON data
                if not request.is_json:
                    return error_response('Request must be JSON', 400)
                
                # Get JSON data
                json_data = request.get_json()
                if json_data is None:
                    return error_response('No JSON data provided', 400)
                
                # Validate against schema
                try:
                    validated_data = schema.load(json_data)
                    # Store validated data in request for use in the route
                    request.validated_data = validated_data
                except ValidationError as err:
                    return error_response('Validation failed', 400, errors=err.messages)
                
                return f(*args, **kwargs)
                
            except Exception as e:
                return error_response(f'Request validation failed: {str(e)}', 400)
        
        return decorated_function
    return decorator

def require_fields(*required_fields):
    """
    Decorator to ensure required fields are present in JSON request
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not request.is_json:
                return error_response('Request must be JSON', 400)
            
            json_data = request.get_json()
            if json_data is None:
                return error_response('No JSON data provided', 400)
            
            missing_fields = []
            for field in required_fields:
                if field not in json_data or json_data[field] is None:
                    missing_fields.append(field)
            
            if missing_fields:
                return error_response(
                    f'Missing required fields: {", ".join(missing_fields)}',
                    400
                )
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

def handle_db_errors(f):
    """
    Decorator to handle common database errors
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except Exception as e:
            # Log the error
            current_app.logger.error(f'Database error in {f.__name__}: {str(e)}')
            
            # Rollback any pending transactions
            from app import db
            db.session.rollback()
            
            # Return generic error message
            return error_response('A database error occurred', 500)
    
    return decorated_function