from django.db import models
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class AuditPeriod(models.Model):
    fiscal_year = models.CharField(
        _('fiscal year'),
        max_length=7,
        unique=True,
        help_text=_('Format: YYYY-YY (e.g., 2025-26)')
    )
    start_date = models.DateField(_('start date'))
    end_date = models.DateField(_('end date'))
    is_active = models.BooleanField(_('is active'), default=True)
    
    class Meta:
        verbose_name = _('audit period')
        verbose_name_plural = _('audit periods')
        ordering = ['-fiscal_year']
    
    def __str__(self):
        return self.fiscal_year
    
    def clean(self):
        """Validate fiscal year format and date ranges"""
        if self.fiscal_year:
            try:
                start_year = int(self.fiscal_year[:4])
                end_year_short = int(self.fiscal_year[5:])
                expected_end_year = start_year + 1
                
                if len(self.fiscal_year) != 7 or self.fiscal_year[4] != '-':
                    raise ValidationError({'fiscal_year': 'Fiscal year must be in format YYYY-YY (e.g., 2025-26)'})
                
                if end_year_short != expected_end_year % 100:
                    raise ValidationError({'fiscal_year': f'End year should be {expected_end_year % 100:02d} for start year {start_year}'})
                    
            except (ValueError, IndexError):
                raise ValidationError({'fiscal_year': 'Fiscal year must be in format YYYY-YY (e.g., 2025-26)'})
        
        # Validate that end date is after start date
        if self.start_date and self.end_date and self.end_date <= self.start_date:
            raise ValidationError({'end_date': 'End date must be after start date'})
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    @property
    def year(self):
        """Backward compatibility - returns the start year of fiscal year"""
        return int(self.fiscal_year[:4])