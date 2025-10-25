from flask import jsonify

def success_response(data=None, message="Success", status_code=200):
    """
    Create a standardized success response
    
    Args:
        data: The response data (dict, list, etc.)
        message: Success message
        status_code: HTTP status code
    
    Returns:
        Flask response object
    """
    response_data = {
        'success': True,
        'message': message,
        'data': data if data is not None else {}
    }
    
    return jsonify(response_data), status_code

def error_response(message="An error occurred", status_code=400, errors=None):
    """
    Create a standardized error response
    
    Args:
        message: Error message
        status_code: HTTP status code
        errors: Additional error details (dict)
    
    Returns:
        Flask response object
    """
    response_data = {
        'success': False,
        'message': message
    }
    
    if errors:
        response_data['errors'] = errors
    
    return jsonify(response_data), status_code

def paginated_response(items, pagination, message="Data retrieved successfully"):
    """
    Create a standardized paginated response
    
    Args:
        items: List of items to return
        pagination: SQLAlchemy pagination object
        message: Success message
    
    Returns:
        Flask response object
    """
    response_data = {
        'success': True,
        'message': message,
        'data': {
            'items': items,
            'pagination': {
                'page': pagination.page,
                'pages': pagination.pages,
                'per_page': pagination.per_page,
                'total': pagination.total,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev,
                'next_num': pagination.next_num,
                'prev_num': pagination.prev_num
            }
        }
    }
    
    return jsonify(response_data), 200