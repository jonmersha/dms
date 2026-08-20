import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class ComplexPasswordValidator:
    """
    Validate whether the password meets minimum complexity rules:
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one digit
    - At least one special character
    """
    
    def validate(self, password, user=None):
        errors = []
        
        if not re.search(r'[A-Z]', password):
            errors.append(_("The password must contain at least one uppercase letter, A-Z."))
            
        if not re.search(r'[a-z]', password):
            errors.append(_("The password must contain at least one lowercase letter, a-z."))
            
        if not re.search(r'[0-9]', password):
            errors.append(_("The password must contain at least one digit, 0-9."))
            
        if not re.search(r'[^a-zA-Z0-9]', password):
            errors.append(_("The password must contain at least one special character (e.g., @, #, $, %, etc.)."))
            
        if errors:
            raise ValidationError(errors)

    def get_help_text(self):
        return _(
            "Your password must contain at least one uppercase letter, one lowercase letter, "
            "one digit, and one special character."
        )
