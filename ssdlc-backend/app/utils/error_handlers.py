from flask import jsonify, current_app
from werkzeug.exceptions import HTTPException
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError
from app.utils.responses import error_response

def register_error_handlers(app):
    """Register global error handlers for the Flask app"""
    
    @app.errorhandler(400)
    def bad_request(error):
        return error_response('Bad request', 400)
    
    @app.errorhandler(401)
    def unauthorized(error):
        return error_response('Unauthorized access', 401)
    
    @app.errorhandler(403)
    def forbidden(error):
        return error_response('Access forbidden', 403)
    
    @app.errorhandler(404)
    def not_found(error):
        return error_response('Resource not found', 404)
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return error_response('Method not allowed', 405)
    
    @app.errorhandler(409)
    def conflict(error):
        return error_response('Resource conflict', 409)
    
    @app.errorhandler(422)
    def unprocessable_entity(error):
        return error_response('Unprocessable entity', 422)
    
    @app.errorhandler(429)
    def too_many_requests(error):
        return error_response('Too many requests', 429)
    
    @app.errorhandler(500)
    def internal_server_error(error):
        current_app.logger.error(f'Internal server error: {str(error)}')
        return error_response('Internal server error', 500)
    
    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        """Handle all HTTP exceptions"""
        return error_response(error.description, error.code)
    
    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        """Handle Marshmallow validation errors"""
        return error_response('Validation failed', 400, errors=error.messages)
    
    @app.errorhandler(IntegrityError)
    def handle_integrity_error(error):
        """Handle database integrity errors"""
        current_app.logger.error(f'Database integrity error: {str(error)}')
        
        # Check for common integrity errors
        error_message = str(error.orig).lower()
        
        if 'unique constraint' in error_message or 'duplicate' in error_message:
            return error_response('Resource already exists', 409)
        elif 'foreign key constraint' in error_message:
            return error_response('Referenced resource does not exist', 400)
        else:
            return error_response('Database constraint violation', 400)
    
    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        """Handle any unexpected errors"""
        current_app.logger.error(f'Unexpected error: {str(error)}', exc_info=True)
        
        # Don't expose internal error details in production
        if current_app.config.get('DEBUG'):
            return error_response(f'Unexpected error: {str(error)}', 500)
        else:
            return error_response('An unexpected error occurred', 500)