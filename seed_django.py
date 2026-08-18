import os
import sys
import json
import django
from decimal import Decimal
from datetime import datetime

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cap.settings')
django.setup()

from users.models import User, Department
from audits.models import AuditPeriod, AuditableEntity, AnnualAuditPlan, PlannedAudit, AuditEngagement, AuditFinding
from django.contrib.auth.models import Group

with open('seed_data.json', 'r') as f:
    data = json.load(f)

# 1. Create a default Audit Period
period, _ = AuditPeriod.objects.get_or_create(
    fiscal_year='2025-26',
    defaults={
        'start_date': '2025-07-01',
        'end_date': '2026-06-30',
        'is_active': True
    }
)

# 2. Seed Universe (AuditableEntity)
entity_map = {}
for u in data.get('universe', []):
    dept, _ = Department.objects.get_or_create(name=u.get('auditingUnit', 'Default Unit'), defaults={'level': 'DIRECTORATE'})
    
    risk_level = u.get('riskLevel', 'MEDIUM').upper()
    if risk_level not in ['HIGH', 'MEDIUM', 'LOW']:
        risk_level = 'MEDIUM'
        
    entity, created = AuditableEntity.objects.get_or_create(
        name=u['name'],
        defaults={
            'entity_type': u.get('category', 'OTHER')[:20],
            'sub_category': u.get('subcategory', '')[:100],
            'department': dept,
            'risk_rating': risk_level,
            'description': u.get('description', '')
        }
    )
    entity_map[u['id']] = entity
    print(f"Universe: {entity.name}")

# 3. Seed Plans (AnnualAuditPlan & PlannedAudit)
plan_map = {}
for p in data.get('plans', []):
    # Determine risk rating for the fallback entity
    risk_level = p.get('riskLevel', 'MEDIUM').upper()
    if risk_level not in ['HIGH', 'MEDIUM', 'LOW']:
        risk_level = 'MEDIUM'
        
    entity = entity_map.get(p['entityId'])
    if not entity:
        dept, _ = Department.objects.get_or_create(name='Default Unit', defaults={'level': 'DIRECTORATE'})
        entity, _ = AuditableEntity.objects.get_or_create(
            name=p['entityName'],
            defaults={'entity_type': 'OTHER', 'risk_rating': risk_level, 'department': dept}
        )
    
    annual_plan, _ = AnnualAuditPlan.objects.get_or_create(
        audit_period=period,
        defaults={
            'title': f"Annual Plan {period.fiscal_year}",
            'status': 'APPROVED' if p.get('status') == 'Approved' else 'DRAFT'
        }
    )
    
    planned_audit, _ = PlannedAudit.objects.get_or_create(
        annual_plan=annual_plan,
        entity=entity,
        quarter_targeted=p.get('targetQuarter', 'Q1'),
        defaults={
            'budgeted_hours': 100.00
        }
    )
    plan_map[p['id']] = planned_audit
    print(f"Planned Audit: {planned_audit}")

# 4. Seed Engagements (AuditEngagement)
eng_map = {}
for e in data.get('engagements', []):
    planned_audit = plan_map.get(e['planId'])
    if not planned_audit:
        continue
        
    eng, _ = AuditEngagement.objects.get_or_create(
        engagement_code=e['id'],
        defaults={
            'planned_audit': planned_audit,
            'status': e['status'].upper() if e['status'] else 'PLANNING',
            'start_date': e['startDate'] if e['startDate'] else None,
            'end_date': e['endDate'] if e['endDate'] else None,
            'wbs': json.loads(e['wbs']) if e.get('wbs') else [],
            'engagement_letter': json.loads(e['engagementLetter']) if e.get('engagementLetter') else {},
            'actual_hours': 0
        }
    )
    eng_map[e['id']] = eng
    print(f"Engagement: {eng.engagement_code}")

# 5. Seed Findings
for f in data.get('findings', []):
    eng = eng_map.get(f['engagementId'])
    if not eng:
        continue
        
    risk_level = f.get('riskLevel', 'MEDIUM').upper()
    if risk_level not in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
        risk_level = 'MEDIUM'
        
    AuditFinding.objects.get_or_create(
        title=f['title'],
        engagement=eng,
        defaults={
            'condition': f.get('description', ''),
            'criteria': f.get('criteria', ''),
            'cause': f.get('rootCause', ''),
            'effect': f.get('impact', ''),
            'recommendation': f.get('recommendations', ''),
            'loss_figures': Decimal(f.get('lossFigures', 0)),
            'risk_level': risk_level,
            'status': 'OPEN',
            'rectification_validation_status': f.get('rectificationValidationStatus', ''),
        }
    )
    print(f"Finding: {f['title']}")

print("Successfully seeded audit data from seed_data.json into Django!")
