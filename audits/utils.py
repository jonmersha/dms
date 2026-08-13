from datetime import date
from .models import AuditPeriod

def get_current_fiscal_year():
    """Get current fiscal year in format '2025-26'"""
    today = date.today()
    # Fiscal year starting July
    fiscal_year_start = today.year if today.month >= 7 else today.year - 1
    fiscal_year_end_short = (fiscal_year_start + 1) % 100
    return f"{fiscal_year_start}-{fiscal_year_end_short:02d}"

def get_current_quarter():
    """Get current quarter based on today's date"""
    today = date.today()
    
    if 7 <= today.month <= 9:
        return 'Q1'
    elif 10 <= today.month <= 12:
        return 'Q2'
    elif 1 <= today.month <= 3:
        return 'Q3'
    else:  # 4 <= today.month <= 6
        return 'Q4'

def get_fiscal_year_range(fiscal_year):
    """Get start and end dates for a fiscal year"""
    start_year = int(fiscal_year[:4])
    return (
        date(start_year, 7, 1),      # July 1 of start year
        date(start_year + 1, 6, 30)  # June 30 of next year
    )