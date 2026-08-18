/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuditContext } from "../context/AuditContext";
import { 
  Plus, 
  Trash2, 
  CheckSquare, 
  Sparkles,
  ClipboardList,
  FolderOpen,
  X,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Check,
  Tag,
  BookOpen,
  Layers,
  FileText,
  AlertCircle,
  ArrowLeft,
  Download,
  Upload,
  Clipboard,
  Edit3
} from 'lucide-react';
import { 
  AuditUniverseEntity, 
  AnnualPlanItem, 
  UserRole,
  CategoryTemplate,
  AuditableArea,
  ChecklistItem
} from '../types';

interface UniversePlanViewProps {
  defaultTab?: 'Registry' | 'Templates';
  hideTabsSelection?: boolean;
}

export default function UniversePlanView({
  defaultTab = 'Registry',
  hideTabsSelection = false
}: UniversePlanViewProps) {
  const { universe, setUniverse: onUpdateUniverse, annualPlan, setAnnualPlan: onUpdateAnnualPlan, activeRole, handleLogSystemAction: onLogAction } = useAuditContext();

  
  // Outer sub-tabs for this page: 'Registry' (main list) or 'Templates' (create specs)
  const [activeTab, setActiveTab] = useState<'Registry' | 'Templates'>(defaultTab);

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  // Synchronized categories/subcategories from localStorage
  const categoriesList = (() => {
    const cached = localStorage.getItem('audit_custom_categories');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.includes('Branch') || parsed.includes('IT System')) {
          return ['Corporate Audit', 'Branch Audit', 'IT Audit', 'Head Office Audit', 'IFB Audit'];
        }
        return parsed;
      } catch (e) {}
    }
    return ['Corporate Audit', 'Branch Audit', 'IT Audit', 'Head Office Audit', 'IFB Audit'];
  })();

  const defaultAuditingUnits = [
    'IT Audit Division',
    'Branch Audit Division',
    'Financial & Ops Section',
    'Compliance & Fraud Investigation Division'
  ];
  const auditingUnitsList = (() => {
    const cached = localStorage.getItem('audit_custom_auditing_units');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return defaultAuditingUnits;
  })();

  const subcategoriesMap = (() => {
    const cached = localStorage.getItem('audit_custom_subcategories_map');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed['IT System'] || parsed['Branch']) {
          return {
            'IT Audit': ['Infrastructure', 'Applications', 'Security/Cybersecurity', 'System Administration', 'Networking'],
            'IFB Audit': ['Financing Murabaha', 'Mudaraba Operations', 'Sharia Compliance', 'IFB Savings & Deposits'],
            'Branch Audit': ['Operations Audit', 'Credit & Loan', 'Cash Management', 'Customer Service'],
            'Head Office Audit': ['Treasury & FX', 'HR Audit', 'Compliance Audit', 'Governance & Admin'],
            'Corporate Audit': ['Financial Operations', 'Board Compliance', 'Corporate Governance', 'Legal Affairs']
          };
        }
        return parsed;
      } catch (e) {}
    }
    return {
      'IT Audit': ['Infrastructure', 'Applications', 'Security/Cybersecurity', 'System Administration', 'Networking'],
      'IFB Audit': ['Financing Murabaha', 'Mudaraba Operations', 'Sharia Compliance', 'IFB Savings & Deposits'],
      'Branch Audit': ['Operations Audit', 'Credit & Loan', 'Cash Management', 'Customer Service'],
      'Head Office Audit': ['Treasury & FX', 'HR Audit', 'Compliance Audit', 'Governance & Admin'],
      'Corporate Audit': ['Financial Operations', 'Board Compliance', 'Corporate Governance', 'Legal Affairs']
    };
  })();

  // Load checklist templates with seeding logic & migration guard
  const [templates, setTemplates] = useState<CategoryTemplate[]>(() => {
    const cached = localStorage.getItem('audit_category_templates');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // If it's the old schema (where auditableAreas is a string array or does not exist), clear it
        if (parsed && parsed.length > 0 && typeof parsed[0].auditableAreas[0] === 'object' && parsed[0].description) {
          return parsed;
        }
      } catch (e) {}
    }
    return [];
  });

  // State for active Checklist Template being inspected or edited in-depth
  const [editingTemplate, setEditingTemplate] = useState<CategoryTemplate | null>(null);

  const handleInitiateCreateTemplate = () => {
    const newTmpl: CategoryTemplate = {
      id: `tmpl-${Date.now()}`,
      name: 'New Custom Checklist Template',
      description: '',
      category: 'Operational',
      auditableAreas: [
        {
          id: `area-${Date.now()}-1`,
          name: 'General Compliance Control Zone',
          description: 'Baseline administrative procedures and directives mapping reviews.',
          checklist: [
            {
              id: `chk-${Date.now()}-1`,
              name: 'Signature Authorization Mandate Test',
              description: 'Compare active authorizations limits against core directives.',
              testProcedures: 'Pull recent transaction samples, match active limit approvals and log checks.',
              controlType: 'Key',
              complianceRef: 'NBE Regulatory Circular'
            }
          ]
        }
      ]
    };
    setEditingTemplate(newTmpl);
  };

  // Sophisticated builder dynamic states for Hierarchical Templates
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [templateCategory, setTemplateCategory] = useState('IT Audit');
  const [builderAreas, setBuilderAreas] = useState<AuditableArea[]>([
    {
      id: 'area-init',
      name: 'General Operational Integrity',
      description: 'Standard reviews of compliance alignment and supervisory controls',
      checklist: [
        {
          id: 'chk-init-1',
          name: 'Policy Alignment Assessment',
          description: 'Assess if operational parameters match NBE directives.',
          testProcedures: 'Pull recent transactions sample, evaluate signature thresholds alignment.',
          controlType: 'Key',
          complianceRef: 'NBE Regulatory Circular 1'
        }
      ]
    }
  ]);

  const handleAddBuilderArea = () => {
    const newArea: AuditableArea = {
      id: `area-${Date.now()}`,
      name: '',
      description: '',
      checklist: []
    };
    setBuilderAreas([...builderAreas, newArea]);
  };

  const handleRemoveBuilderArea = (id: string) => {
    setBuilderAreas(builderAreas.filter(a => a.id !== id));
  };

  const handleUpdateBuilderArea = (id: string, field: 'name' | 'description', val: string) => {
    setBuilderAreas(builderAreas.map(a => {
      if (a.id === id) {
        return { ...a, [field]: val };
      }
      return a;
    }));
  };

  const handleAddBuilderChecklistItem = (areaId: string) => {
    setBuilderAreas(builderAreas.map(a => {
      if (a.id === areaId) {
        return {
          ...a,
          checklist: [
            ...a.checklist,
            {
              id: `chk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              name: '',
              description: '',
              testProcedures: '',
              controlType: 'Standard',
              complianceRef: ''
            }
          ]
        };
      }
      return a;
    }));
  };

  const handleUpdateBuilderChecklistItem = (
    areaId: string, 
    chkId: string, 
    field: keyof ChecklistItem, 
    val: any
  ) => {
    setBuilderAreas(builderAreas.map(a => {
      if (a.id === areaId) {
        const updatedChecklist = a.checklist.map(c => {
          if (c.id === chkId) {
            return { ...c, [field]: val };
          }
          return c;
        });
        return { ...a, checklist: updatedChecklist };
      }
      return a;
    }));
  };

  const handleRemoveBuilderChecklistItem = (areaId: string, chkId: string) => {
    setBuilderAreas(builderAreas.map(a => {
      if (a.id === areaId) {
        return {
          ...a,
          checklist: a.checklist.filter(c => c.id !== chkId)
        };
      }
      return a;
    }));
  };

  // Add checklist template handler
  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) {
      showAlert("Please provide a checklist template name.");
      return;
    }

    if (builderAreas.length === 0) {
      showAlert("Please add at least one Auditable Area before saving.");
      return;
    }

    // Process and filter builders areas
    const processedAreas = builderAreas.map(area => {
      const areaNameProcessed = area.name.trim() || 'Untitled Auditable Area';
      const cleanChecklist = area.checklist.filter(c => c.name.trim() !== '').map(c => ({
        ...c,
        name: c.name.trim(),
        description: c.description.trim() || 'Standard compliance and internal safety checklist controls evaluation procedures.',
        testProcedures: c.testProcedures.trim() || 'Examine standard system settings and supervisory authorization logs.',
      }));

      return {
        ...area,
        name: areaNameProcessed,
        description: area.description.trim() || 'Auditable target focus control scope guidelines.',
        checklist: cleanChecklist
      };
    });

    const created: CategoryTemplate = {
      id: `tmpl-${Date.now()}`,
      name: templateName.trim(),
      description: templateDesc.trim() || 'Robust reusable category verification blueprint checklist standards.',
      category: templateCategory,
      auditableAreas: processedAreas
    };

    const updated = [...templates, created];
    updateTemplatesList(updated);

    // Resetbuilder states parameters
    setTemplateName('');
    setTemplateDesc('');
    setBuilderAreas([
      {
        id: 'area-init',
        name: 'General Operational Integrity',
        description: 'Standard reviews of compliance alignment and supervisory controls',
        checklist: [
          {
            id: 'chk-init-1',
            name: 'Policy Alignment Assessment',
            description: 'Assess if operational parameters match NBE directives.',
            testProcedures: 'Pull recent transactions sample, evaluate signature thresholds alignment.',
            controlType: 'Key',
            frequency: 'Monthly',
            complianceRef: 'NBE Regulatory Circular 1'
          }
        ]
      }
    ]);

    onLogAction('Checklist Template Created', `Created Checklist Template "${created.name}" under category: ${created.category}`);
    showAlert(`Successfully created Checklist Template: "${created.name}"!`);
  };

  // State for toggling add entity form drawer/modal
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntity, setNewEntity] = useState({
    name: '',
    category: categoriesList[0] || 'IT Audit',
    subcategory: '',
    auditingUnit: auditingUnitsList.filter(u => u.toLowerCase() !== 'follow up team')[0] || defaultAuditingUnits[0],
    templateId: ''
  });

  // State for bulk selection
  const [selectedEntityIds, setSelectedEntityIds] = useState<Set<string>>(new Set());

  // Recycle bin state
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  const activeUniverse = universe.filter(u => !u.isDeleted);
  const recycledUniverse = universe.filter(u => u.isDeleted);

  const handleSelectAllEntities = (checked: boolean) => {
    if (checked) {
      setSelectedEntityIds(new Set(activeUniverse.map(u => u.id)));
    } else {
      setSelectedEntityIds(new Set());
    }
  };

  const handleSelectEntity = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedEntityIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedEntityIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (activeRole !== 'Admin' && activeRole !== 'Manager') {
      showAlert("Unauthorized permissions. Account Manager or Admin status required.");
      return;
    }
    if (selectedEntityIds.size === 0) return;
    
    showConfirm(`Are you sure you want to move ${selectedEntityIds.size} selected entities to the Recycle Bin?`, () => {
      const updated = universe.map(u => selectedEntityIds.has(u.id) ? { ...u, isDeleted: true } : u);
      onUpdateUniverse(updated);
      setSelectedEntityIds(new Set());
      onLogAction('Bulk Entity Trashed', `Moved ${selectedEntityIds.size} entities to the Recycle Bin.`);
    });
  };

  const handleDeleteAllUniverse = () => {
    if (activeRole !== 'Admin' && activeRole !== 'Manager') {
      showAlert("Unauthorized permissions. Account Manager or Admin status required.");
      return;
    }
    
    showConfirm("WARNING: Are you sure you want to move ALL active entities to the Recycle Bin?", () => {
      const updated = universe.map(u => u.isDeleted ? u : { ...u, isDeleted: true });
      onUpdateUniverse(updated);
      setSelectedEntityIds(new Set());
      onLogAction('Trash All Entities', `Moved all active entities to the Recycle Bin.`);
    });
  };

  const handleRestoreEntity = (id: string, name: string) => {
    const updated = universe.map(u => u.id === id ? { ...u, isDeleted: false } : u);
    onUpdateUniverse(updated);
    onLogAction('Entity Restored', `Restored entity "${name}" from the Recycle Bin.`);
  };

  const handlePermanentlyDeleteEntity = (id: string, name: string) => {
    showConfirm(`WARNING: Are you sure you want to permanently delete "${name}"? This cannot be undone.`, () => {
      const filtered = universe.filter(u => u.id !== id);
      onUpdateUniverse(filtered);
      onLogAction('Entity Permanently Deleted', `Permanently removed entity "${name}".`);
    });
  };

  const handleEmptyRecycleBin = () => {
    showConfirm("WARNING: Are you sure you want to clear the Recycle Bin? All trashed entities will be permanently deleted.", () => {
      const filtered = universe.filter(u => !u.isDeleted);
      onUpdateUniverse(filtered);
      onLogAction('Empty Recycle Bin', `Permanently deleted all entities in the Recycle Bin.`);
      setShowRecycleBin(false);
    });
  };

  // Excel/CSV Bulk Importer Integration States
  const [showImportPanel, setShowImportPanel] = useState(false);
  const [importPasteText, setImportPasteText] = useState('');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Template Import States
  const [showTemplateImportPanel, setShowTemplateImportPanel] = useState(false);
  const [templateImportErrors, setTemplateImportErrors] = useState<string[]>([]);
  const [parsedTemplatePreview, setParsedTemplatePreview] = useState<any[]>([]);
  const [templateDragActive, setTemplateDragActive] = useState(false);

  // Custom Modal States (to bypass iframe blocks on window.confirm/alert)
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: (() => void) | null }>({
    isOpen: false,
    message: '',
    onConfirm: null
  });
  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: ''
  });

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, message, onConfirm });
  };

  const showAlert = (message: string) => {
    setAlertDialog({ isOpen: true, message });
  };

  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentToken = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentToken += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(currentToken.trim());
        currentToken = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        row.push(currentToken.trim());
        lines.push(row);
        row = [];
        currentToken = '';
      } else {
        currentToken += char;
      }
    }
    if (currentToken || row.length > 0) {
      row.push(currentToken.trim());
      lines.push(row);
    }
    return lines.filter(r => r.length > 0 && r.some(cell => cell !== ''));
  };

  const parseTSV = (text: string): string[][] => {
    return text
      .split(/\r?\n/)
      .map(line => line.split('\t').map(cell => cell.trim()))
      .filter(row => row.length > 0 && row.some(rowCell => rowCell !== ''));
  };

  const handleParseAndPreview = (textToShow: string, isTSV: boolean) => {
    if (!textToShow.trim()) {
      setImportErrors(['No text or values provided to parse.']);
      setParsedPreview([]);
      return;
    }
    const rawRows = isTSV ? parseTSV(textToShow) : parseCSV(textToShow);
    handleParseData(rawRows);
  };

  const handleParseData = (rawData: string[][]) => {
    if (rawData.length < 2) {
      setImportErrors(['No records found inside rows. Make sure the first line has headers and subsequent ones have data.']);
      setParsedPreview([]);
      return;
    }

    const headers = rawData[0].map(h => h.toLowerCase().trim().replace(/[^a-z0-9 ]/g, ''));
    
    const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('entity'));
    const categoryIndex = headers.findIndex(h => h.includes('category') && !h.includes('sub'));
    const subcategoryIndex = headers.findIndex(h => h.includes('sub'));
    const unitIndex = headers.findIndex(h => h.includes('unit') || h.includes('division') || h.includes('auditing'));

    if (nameIndex === -1 || categoryIndex === -1) {
      setImportErrors([
        'Could not map critical columns automatically. Please make sure headers contain "Entity Name" (or "Name") and "Category".',
        `Headers found: ${rawData[0].join(', ')}`
      ]);
      setParsedPreview([]);
      return;
    }

    const previewList: any[] = [];
    const errors: string[] = [];

    for (let r = 1; r < rawData.length; r++) {
      const row = rawData[r];
      if (row.length === 0 || row.every(cell => cell === '')) continue;

      const name = row[nameIndex] || '';
      if (!name) {
        errors.push(`Row ${r + 1}: Skipped due to empty Entity Name.`);
        continue;
      }

      const cat = row[categoryIndex] || '';
      let cleanCat = 'IT Audit';
      const lowercaseCat = cat.toLowerCase();
      if (lowercaseCat.includes('it')) cleanCat = 'IT Audit';
      else if (lowercaseCat.includes('branch')) cleanCat = 'Branch Audit';
      else if (lowercaseCat.includes('corporate')) cleanCat = 'Corporate Audit';
      else if (lowercaseCat.includes('head') || lowercaseCat.includes('office')) cleanCat = 'Head Office Audit';
      else if (lowercaseCat.includes('ifb') || lowercaseCat.includes('islamic')) cleanCat = 'IFB Audit';
      else {
        const matched = categoriesList.find(c => c.toLowerCase().includes(lowercaseCat)) || categoriesList[0] || 'IT Audit';
        cleanCat = matched;
      }

      const subcat = subcategoryIndex !== -1 ? row[subcategoryIndex] || '' : '';
      const auditingUnit = unitIndex !== -1 ? row[unitIndex] || '' : (cleanCat === 'IT Audit' ? 'IT Audit Division' : 'Branch Audit Division');
      
      const riskScore = 3.0;
      let riskLevel: 'High' | 'Medium' | 'Low' = 'Medium';

      // Link closest checklist template automatically if available
      // Per user request, do not attach Checklist/Template by default during upload
      const templateId = undefined;

      previewList.push({
        id: `ent-import-${Date.now()}-${r}-${Math.random().toString(36).substr(2, 4)}`,
        name,
        category: cleanCat,
        subcategory: subcat,
        auditingUnit,
        riskScore,
        riskLevel,
        templateId
      });
    }

    setImportErrors(errors);
    setParsedPreview(previewList);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadedFile(e.target.files[0]);
    }
  };

  const handleUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportPasteText(text);
      const isTSV = file.name.endsWith('.tsv') || file.name.endsWith('.txt');
      const parsedData = isTSV ? parseTSV(text) : parseCSV(text);
      handleParseData(parsedData);
    };
    reader.readAsText(file);
  };

  const saveImportedEntities = () => {
    if (parsedPreview.length === 0) return;
    
    const updatedUniverse = [...universe, ...parsedPreview];
    onUpdateUniverse(updatedUniverse);
    
    onLogAction('Bulk Entity Import', `Imported ${parsedPreview.length} entities into the Audit Universe registry via Excel/CSV parser.`);
    showAlert(`Successfully imported ${parsedPreview.length} auditable entities into your active Audit Universe!`);
    
    // Clear state & close panel
    setParsedPreview([]);
    setImportPasteText('');
    setImportErrors([]);
    setShowImportPanel(false);
  };

  // --- Template Import Logic ---
  const handleTemplateParseData = (rawData: string[][]) => {
    if (rawData.length < 2) {
      setTemplateImportErrors(['No records found inside rows. Make sure the first line has headers and subsequent ones have data.']);
      setParsedTemplatePreview([]);
      return;
    }

    const headers = rawData[0].map(h => h.toLowerCase().trim().replace(/[^a-z0-9 ]/g, ''));
    
    const nameIndex = headers.findIndex(h => h.includes('template') && h.includes('name'));
    const categoryIndex = headers.findIndex(h => h.includes('category') && !h.includes('sub'));
    const descriptionIndex = headers.findIndex(h => h.includes('description') && !h.includes('area'));
    const areaNameIndex = headers.findIndex(h => h.includes('area') && h.includes('name'));
    const areaDescIndex = headers.findIndex(h => h.includes('area') && h.includes('description'));

    if (nameIndex === -1 || categoryIndex === -1) {
      setTemplateImportErrors([
        'Could not map critical columns automatically. Please make sure headers contain "Template Name" and "Category".',
        `Headers found: ${rawData[0].join(', ')}`
      ]);
      setParsedTemplatePreview([]);
      return;
    }

    const groupedTemplates: Record<string, any> = {};
    const errors: string[] = [];

    for (let r = 1; r < rawData.length; r++) {
      const row = rawData[r];
      if (row.length === 0 || row.every(cell => cell === '')) continue;

      const name = row[nameIndex] || '';
      if (!name) {
        errors.push(`Row ${r + 1}: Skipped due to empty Template Name.`);
        continue;
      }

      const cat = row[categoryIndex] || '';
      let cleanCat = 'IT Audit';
      const lowercaseCat = cat.toLowerCase();
      if (lowercaseCat.includes('it')) cleanCat = 'IT Audit';
      else if (lowercaseCat.includes('branch')) cleanCat = 'Branch Audit';
      else if (lowercaseCat.includes('corporate')) cleanCat = 'Corporate Audit';
      else if (lowercaseCat.includes('head') || lowercaseCat.includes('office')) cleanCat = 'Head Office Audit';
      else if (lowercaseCat.includes('ifb') || lowercaseCat.includes('islamic')) cleanCat = 'IFB Audit';
      else {
        const matched = categoriesList.find(c => c.toLowerCase().includes(lowercaseCat)) || categoriesList[0] || 'IT Audit';
        cleanCat = matched;
      }

      const description = descriptionIndex !== -1 ? row[descriptionIndex] : '';
      const areaName = areaNameIndex !== -1 ? row[areaNameIndex] : '';
      const areaDesc = areaDescIndex !== -1 ? row[areaDescIndex] : '';

      if (!groupedTemplates[name]) {
        groupedTemplates[name] = {
          id: `tmpl-import-${Date.now()}-${r}-${Math.random().toString(36).substr(2, 4)}`,
          name,
          category: cleanCat,
          description,
          auditableAreas: []
        };
      }
      
      if (areaName) {
        groupedTemplates[name].auditableAreas.push({
          id: `area-import-${Date.now()}-${r}-${Math.random().toString(36).substr(2, 4)}`,
          name: areaName,
          description: areaDesc
        });
      }
    }

    setTemplateImportErrors(errors);
    setParsedTemplatePreview(Object.values(groupedTemplates));
  };

  const handleTemplateDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setTemplateDragActive(true);
    } else if (e.type === "dragleave") {
      setTemplateDragActive(false);
    }
  };

  const handleTemplateDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTemplateDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleTemplateUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleTemplateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleTemplateUploadedFile(e.target.files[0]);
    }
  };

  const handleTemplateUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const isTSV = file.name.endsWith('.tsv') || file.name.endsWith('.txt');
      const parsedData = isTSV ? parseTSV(text) : parseCSV(text);
      handleTemplateParseData(parsedData);
    };
    reader.readAsText(file);
  };

  const saveImportedTemplates = () => {
    if (parsedTemplatePreview.length === 0) return;
    
    const updatedList = [...templates, ...parsedTemplatePreview];
    updateTemplatesList(updatedList);
    
    onLogAction('Bulk Template Import', `Imported ${parsedTemplatePreview.length} templates into the registry.`);
    showAlert(`Successfully imported ${parsedTemplatePreview.length} master Checklist Templates!`);
    
    setParsedTemplatePreview([]);
    setTemplateImportErrors([]);
    setShowTemplateImportPanel(false);
  };

  const downloadTemplateCSVTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [
          "Template Name,Category,Template Description,Area Name,Area Description",
          "Core Network Infrastructure Audit,IT Audit,Annual deep-dive into network core and routers.,Firewall Configurations,Review inbound and outbound ACL rules for anomalies.",
          "Core Network Infrastructure Audit,IT Audit,Annual deep-dive into network core and routers.,Device Firmware,Check switches and routers for latest stable firmware.",
          "Standard Branch Quarterly Operations,Branch Audit,Routine operational and cash checks for domestic branches.,Cash Vault Security,Verify dual-control and physical access logs.",
          "Standard Branch Quarterly Operations,Branch Audit,Routine operational and cash checks for domestic branches.,Teller Drawer Balancing,Sample 10 random teller sessions for discrepancies."
        ].join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Audit_Category_Templates_Import.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCSVTemplate = () => {
    const header = "Entity Name,Category,Sub-category,Auditing Unit";
    
    // Generate an example row for each configured Auditing Unit
    const sampleRows = auditingUnitsList.map((unit, idx) => {
      // Pick a category. Try to find a logical one or just round-robin
      const cat = categoriesList[idx % categoriesList.length] || '';
      // Pick a subcategory if available
      const subs = subcategoriesMap[cat] || [];
      const subcat = subs.length > 0 ? subs[0] : '';
      
      const entityName = `Sample Entity ${idx + 1} (${unit})`;
      return `"${entityName}","${cat}","${subcat}","${unit}"`;
    });

    const csvContent = "data:text/csv;charset=utf-8," + [header, ...sampleRows].join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.setAttribute("download", "audit_universe_excel_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onLogAction('Template Downloaded', 'Downloaded audit universe import excel-template schema');
  };

  // Modal selector or inspector for template details
  const [inspectingTemplate, setInspectingTemplate] = useState<CategoryTemplate | null>(null);

  // Template Checklist CSV handlers
  const handleDownloadTemplateChecklistCSV = () => {
    const csvContent = "Area Name,Area Description,Checklist Name,Checklist Description,Test Procedures,Control Type\n"
      + "Finance,Finance audit,Payroll Review,Review payroll process,Check salary slips,Standard\n"
      + "Finance,,Expense Audit,Review expenses,Check receipts,Key\n"
      + "IT,IT security,Firewall Review,Review firewall rules,Check configs,Automated\n";
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.href = encodedUri;
    link.setAttribute("download", "auditable_areas_checklist_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onLogAction('CSV Template Downloaded', 'Downloaded template for auditable areas extraction');
  };

  const handleUploadTemplateChecklistCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length < 2) {
        showAlert("Invalid CSV: Must have headers and at least one row");
        return;
      }
      
      const newAreasMap = new Map<string, AuditableArea>();
      let internalIdCounter = Date.now();

      for (let i = 1; i < lines.length; i++) {
        // very simple csv split respecting quotes for multiple columns
        const regex = /("([^"]|"")*"|[^,]*)(?=\s*,|\s*$)/g;
        const matches = [];
        let m;
        while ((m = regex.exec(lines[i])) !== null) {
          matches.push(m[1].replace(/(^"|"$)/g, '').replace(/""/g, '"').trim());
          if (regex.lastIndex === lines[i].length) break;
        }

        if (matches.length < 1 || !matches[0]) continue;
        
        const areaName = matches[0] || 'Unknown Area';
        const areaDesc = matches[1] || '';
        const chkName = matches[2] || '';
        const chkDesc = matches[3] || '';
        const chkTest = matches[4] || '';
        const rawType = matches[5] || 'Standard';
        const cType: 'Key' | 'Standard' | 'Automated' | 'Manual' = 
          ['Key', 'Standard', 'Automated', 'Manual'].includes(rawType) 
            ? (rawType as any) : 'Standard';

        if (!newAreasMap.has(areaName)) {
          newAreasMap.set(areaName, {
            id: 'area-' + (internalIdCounter++),
            name: areaName,
            description: areaDesc,
            checklist: []
          });
        }
        
        if (chkName) {
          newAreasMap.get(areaName)!.checklist.push({
            id: 'chk-' + (internalIdCounter++),
            name: chkName,
            description: chkDesc,
            testProcedures: chkTest,
            controlType: cType
          });
        }
      }

      setEditingTemplate(prev => prev ? {
        ...prev,
        auditableAreas: [...prev.auditableAreas, ...Array.from(newAreasMap.values())]
      } : null);
      
      onLogAction('CSV Uploaded', `Imported ${newAreasMap.size} auditable areas into template`);
    };
    reader.readAsText(file);
    e.target.value = ''; // reset file input
  };

  
  // State for collapsible checklists in auditable areas (mapped by area ID to collapse state)
  const [collapsedAreas, setCollapsedAreas] = useState<Record<string, boolean>>({});

  const toggleAreaChecklist = (areaId: string) => {
    setCollapsedAreas(prev => ({
      ...prev,
      [areaId]: !prev[areaId]
    }));
  };
  
  // Linking entities manually: state to select template for a specific entity
  const [associatingEntity, setAssociatingEntity] = useState<AuditUniverseEntity | null>(null);
  const [editingUniverseEntity, setEditingUniverseEntity] = useState<AuditUniverseEntity | null>(null);

  // Persistence handler for templates list
  const updateTemplatesList = (updated: CategoryTemplate[]) => {
    setTemplates(updated);
    localStorage.setItem('audit_category_templates', JSON.stringify(updated));
  };

  // Delete Checklist Template
  const handleDeleteTemplate = (id: string, name: string) => {
    if (activeRole !== 'Admin' && activeRole !== 'Manager') {
      showAlert("Unauthorized permissions. Senior manager credentials required.");
      return;
    }
    showConfirm(`Are you sure you want to delete the template "${name}"? Entities linked to it will retain reference but lose custom spec.`, () => {
      const filtered = templates.filter(tmpl => tmpl.id !== id);
      updateTemplatesList(filtered);
      onLogAction('Checklist Template Deleted', `Deleted Checklist Template "${name}"`);
    });
  };

  // Add Item to Universe Registry
  const handleAddUniverseEntity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntity.name.trim()) return;

    const created: AuditUniverseEntity = {
      id: `ent-${Date.now()}`,
      name: newEntity.name.trim(),
      category: newEntity.category,
      subcategory: newEntity.subcategory || '',
      auditingUnit: newEntity.auditingUnit,
      riskScore: 3.0,
      riskLevel: 'Medium',
      templateId: newEntity.templateId || undefined
    };

    onUpdateUniverse([...universe, created]);
    setShowAddForm(false);
    setNewEntity({
      name: '',
      category: categoriesList[0] || 'IT Audit',
      subcategory: '',
      auditingUnit: auditingUnitsList.filter(u => u.toLowerCase() !== 'follow up team')[0] || defaultAuditingUnits[0],
      templateId: ''
    });

    onLogAction('Entity Registration', `Added "${created.name}" (Division: ${created.auditingUnit}, Template ID: ${created.templateId || 'None'}) into Audit Universe.`);
  };

  // Delete entity safely
  const handleDeleteEntity = (id: string, name: string) => {
    if (activeRole !== 'Admin' && activeRole !== 'Manager') {
      showAlert("Unauthorized permissions. Account Manager or Admin status required.");
      return;
    }
    showConfirm(`Are you sure you want to move "${name}" to the Recycle Bin?`, () => {
      const updated = universe.map(u => u.id === id ? { ...u, isDeleted: true } : u);
      onUpdateUniverse(updated);
      onLogAction('Entity Trashed', `Moved entity "${name}" to the Recycle Bin.`);
    });
  };

  // Handle manual attachment update
  const handleConfirmTemplateAttachment = (templateId: string) => {
    if (!associatingEntity) return;

    const updated = universe.map(ent => {
      if (ent.id === associatingEntity.id) {
        return { ...ent, templateId: templateId || undefined };
      }
      return ent;
    });

    onUpdateUniverse(updated);
    onLogAction('Template Link Modified', `Attached Template ID: ${templateId || 'None'} to audit entity "${associatingEntity.name}"`);
    setAssociatingEntity(null);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="universe_definitions_panel">
      
      {!editingTemplate && !inspectingTemplate ? (
        <>
          {/* View Header Info */}
          {!hideTabsSelection && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-205 pb-5" id="universe_view_header">
          <div>
            <h1 className="text-2xl font-semibold text-slate-905 tracking-tight flex items-center gap-2 uppercase">
              Audit Universe Directory & Specs
            </h1>
            <p className="text-xs text-slate-500 font-medium pb-1.5">
              Define individual baseline components of your audit universe, and align them with **Category Audit Templates** containing checklists and auditable areas.
            </p>
            
            {/* Main Sub Tabs */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setActiveTab('Registry')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  activeTab === 'Registry' 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                Audit Universe Registry ({activeUniverse.length})
              </button>
              <button
                onClick={() => setActiveTab('Templates')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                  activeTab === 'Templates' 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                Checklist Templates ({templates.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Registry' ? (
        <>
          {/* Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm" id="sub_universe_header">
            <div className="space-y-1">
              <span className="text-sm text-slate-700 font-semibold uppercase tracking-wider block">
                Catalogued Entities with Custom Checklists
              </span>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">Templates are attached per category and shared across matching applications/branches (larger text rendering active).</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => {
                  setShowImportPanel(!showImportPanel);
                  setShowAddForm(false);
                  setShowRecycleBin(false);
                }}
                className={`flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-all border cursor-pointer ${
                  showImportPanel 
                    ? 'bg-slate-900 border-slate-900 text-white hover:bg-slate-800 text-[13px] md:text-sm' 
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-255 text-[13px] md:text-sm shadow-xs'
                }`}
                id="toggle_excel_import_btn"
              >
                <Upload className="w-4 h-4 text-emerald-600 animate-pulse" />
                Import from Excel / CSV
              </button>

              <button
                onClick={() => {
                  setShowRecycleBin(!showRecycleBin);
                  setShowAddForm(false);
                  setShowImportPanel(false);
                }}
                className={`flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-all border cursor-pointer ${
                  showRecycleBin 
                    ? 'bg-red-600 border-red-650 text-white hover:bg-red-750' 
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-255'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                Recycle Bin ({recycledUniverse.length})
              </button>

              <button
                onClick={() => {
                  setShowAddForm(!showAddForm);
                  setShowImportPanel(false);
                  setShowRecycleBin(false);
                }}
                className={`flex items-center gap-2 text-sm px-5 py-2.5 rounded-lg font-semibold shadow-sm transition-all border cursor-pointer ${
                  showAddForm 
                    ? 'bg-indigo-600 border-indigo-650 text-white hover:bg-indigo-750 text-[13px] md:text-sm' 
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-255 text-[13px] md:text-sm shadow-xs'
                }`}
                id="toggle_add_entity_manual_btn"
              >
                <Plus className="w-4 h-4" />
                Add Auditable Entity
              </button>
            </div>
          </div>

          {/* Bulk Import / Excel Integration Panel */}
          {showImportPanel && (
            <div className="bg-white p-6 rounded-xl border border-slate-250 shadow-md space-y-6 animate-fade-in" id="bulk_import_panel">
              <div className="flex items-center justify-between border-b border-slate-205 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-55 text-emerald-800 rounded-lg">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                      Bulk Excel & CSV Importer
                    </h3>
                    <p className="text-xs md:text-sm text-slate-500 font-medium mt-0.5">
                      Easily populate your Audit Universe in batch using spreadsheet records.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={downloadCSVTemplate}
                    className="flex items-center gap-2 text-[13px] md:text-sm font-semibold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100/70 px-4 py-2.5 rounded-lg border border-indigo-200 transition-all cursor-pointer shadow-xs"
                    id="download_import_template_btn"
                  >
                    <Download className="w-4 h-4" />
                    Download Excel/CSV Template
                  </button>
                  <button onClick={() => setShowImportPanel(false)} className="text-slate-400 hover:text-slate-650 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Steps or Guide */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-slate-50 p-5 rounded-xl border border-slate-150">
                <div className="space-y-1.5">
                  <span className="text-sm uppercase font-bold text-indigo-650 tracking-wide block">Step 1: Format Template</span>
                  <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed">
                    Download the template or copy headers: <code className="bg-white px-2 py-0.5 rounded border border-slate-250 font-mono text-xs text-indigo-750 font-bold">Entity Name</code>, <code className="bg-white px-2 py-0.5 rounded border border-slate-250 font-mono text-xs text-indigo-750 font-bold">Category</code>. Make sure columns match the header specifications.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-sm uppercase font-bold text-emerald-700 tracking-wide block">Step 2: Drag & Drop or Paste</span>
                  <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed">
                    Either drag your <code className="bg-white text-slate-800 px-1.5 py-0.5 rounded border border-slate-250 font-mono text-xs font-bold">.csv</code> file, browse local storage, or copy sheets directly from Microsoft Excel or Google Sheets and paste them right into the text container.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-sm uppercase font-bold text-amber-700 tracking-wide block">Step 3: Preview and Save</span>
                  <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed">
                    Check the live parsing table. The system automatically computes risk score ratings and maps default audit category checklists safely before saving.
                  </p>
                </div>
              </div>

              {/* Upload Workspace split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Drag / Drop / Browse area */}
                <div className="space-y-3">
                  <label className="block text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wider">Option A: Upload or Drop CSV File</label>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all min-h-[200px] ${
                      dragActive 
                        ? "border-indigo-600 bg-indigo-50/50" 
                        : "border-slate-300 bg-white hover:border-slate-400"
                    }`}
                  >
                    <Upload className="w-10 h-10 text-indigo-500 mb-3 animate-bounce" />
                    <p className="text-sm font-bold text-slate-800 text-center mb-1">
                      Drag and drop your spreadsheet file here
                    </p>
                    <p className="text-xs md:text-sm text-slate-500 font-medium text-center mb-5">
                      Supports comma-separated (.csv) and standard copy text (.txt)
                    </p>
                    <label className="relative inline-flex items-center gap-2 bg-indigo-50/80 hover:bg-indigo-100/90 border border-indigo-200 shadow-sm px-5 py-2.5 hover:bg-slate-50 transition-colors rounded-lg text-[13px] md:text-sm font-semibold text-indigo-850 cursor-pointer">
                      Browse Files
                      <input
                        type="file"
                        accept=".csv,.tsv,.txt"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Direct Excel copy-paste area */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wider">Option B: Copy / Paste from Excel Grid</label>
                    <button 
                      type="button"
                      onClick={() => {
                        // Generate sample rows based on configured units
                        const header = "Entity Name,Category,Sub-category,Auditing Unit";
                        const sampleRows = auditingUnitsList.slice(0, 3).map((unit, idx) => {
                          const cat = categoriesList[idx % categoriesList.length] || '';
                          const subs = subcategoriesMap[cat] || [];
                          const subcat = subs.length > 0 ? subs[0] : '';
                          return `Sample Entity ${idx + 1},${cat},${subcat},${unit}`;
                        });
                        const sample = [header, ...sampleRows].join('\n');
                        setImportPasteText(sample);
                        handleParseAndPreview(sample, false);
                      }}
                      className="text-xs md:text-sm font-bold text-indigo-700 hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      💡 Insert Sample Data
                    </button>
                  </div>
                  <div className="space-y-2">
                    <textarea
                      rows={6}
                      placeholder="Paste your copied spreadsheet rows here...&#10;Include headers (e.g., Entity Name, Category, etc.) separated by commas or tabs."
                      value={importPasteText}
                      onChange={(e) => {
                        const val = e.target.value;
                        setImportPasteText(val);
                        // Determine if input is more likely TSV/spreadsheet-copied (contains tabs) or CSV
                        const isTSV = val.includes('\t');
                        handleParseAndPreview(val, isTSV);
                      }}
                      className="block w-full p-4 bg-slate-50/50 border border-slate-300 rounded-xl font-mono text-xs md:text-sm font-bold focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-650 transition-all placeholder:text-slate-450 text-slate-900"
                    />
                    <p className="text-xs md:text-sm text-slate-500 font-bold">Parsed automatically on input. You can copy a selection inside Excel and paste it directly.</p>
                  </div>
                </div>
              </div>

              {/* Status / Parsing Errors rendering */}
              {importErrors.length > 0 && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-805 text-xs font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Import Parsing Notifications / Warnings:</span>
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-amber-700/90 leading-relaxed font-semibold pl-1.5">
                    {importErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Interactive Parsed preview grid */}
              {parsedPreview.length > 0 && (
                <div className="border border-slate-300 rounded-xl overflow-hidden shadow-sm space-y-4 bg-slate-50/20 p-5">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm md:text-base font-bold text-slate-800">📊 Ready to Register:</span>
                      <span className="text-sm bg-emerald-100 text-emerald-805 font-bold px-3 py-1 rounded-full font-sans shadow-sm">
                        {parsedPreview.length} Entities
                      </span>
                    </div>
                    <span className="text-xs md:text-sm text-slate-500 font-semibold">Standard risk score aggregates are generated instantly.</span>
                  </div>

                  <div className="overflow-x-auto max-h-[300px] border border-slate-205 rounded-lg">
                    <table className="w-full text-left text-xs md:text-sm border-collapse bg-white">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-250 text-xs font-bold text-slate-600 uppercase tracking-wider">
                          <th className="p-3.5">Entity Name</th>
                          <th className="p-3.5">Category</th>
                          <th className="p-3.5">Sub-category</th>
                          <th className="p-3.5 text-center font-bold">Calculated Score</th>
                          <th className="p-3.5">Template Auto-Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 font-semibold text-slate-800">
                        {parsedPreview.map((item, index) => {
                          const linkedTemplate = templates.find(t => t.id === item.templateId);
                          return (
                            <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                              <td className="p-3.5 font-bold text-slate-900 text-sm">{item.name}</td>
                              <td className="p-3.5">
                                <span className="text-xs bg-slate-100 px-2.5 py-1 rounded font-bold uppercase text-slate-700 tracking-wider">
                                  {item.category}
                                </span>
                              </td>
                              <td className="p-3.5 text-slate-700 text-xs md:text-sm">{item.subcategory || '—'}</td>
                              <td className="p-3.5 text-center font-sans">
                                <span className={`inline-flex items-center gap-1 font-bold px-2 py-1 rounded text-xs ${
                                  item.riskLevel === 'High' 
                                    ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                                    : item.riskLevel === 'Medium' 
                                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-805 border border-emerald-200'
                                }`}>
                                  ⭐ {item.riskScore} ({item.riskLevel})
                                </span>
                              </td>
                              <td className="p-3.5 text-indigo-700 font-bold text-xs md:text-sm max-w-[160px] truncate">
                                {linkedTemplate ? `🔒 ${linkedTemplate.name}` : '❌ No matched template'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setParsedPreview([]);
                        setImportPasteText('');
                        setImportErrors([]);
                      }}
                      className="px-5 py-2.5 border border-slate-250 text-sm text-slate-700 font-bold hover:bg-slate-50 rounded-lg cursor-pointer transition-colors shadow-xs"
                    >
                      Clear All
                    </button>
                    <button
                      type="button"
                      onClick={saveImportedEntities}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-sm text-white font-bold rounded-lg shadow-sm cursor-pointer flex items-center gap-2 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      Approve and Register {parsedPreview.length} Entities
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add Entity Form Drawer */}
          {showAddForm && (
            <div className="bg-white p-6 rounded-xl border border-slate-250 shadow-md space-y-5 animate-fade-in" id="add_entity_panel">
              <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Plus className="text-indigo-600 w-5 h-5" /> Register New Auditable Universe Entity
                </h3>
                <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-655 p-1 rounded-full cursor-pointer hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddUniverseEntity} className="grid grid-cols-1 md:grid-cols-3 gap-5" id="add_entity_form">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Entity Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SWIFT Gateway, Awassa Branch"
                    value={newEntity.name}
                    onChange={e => setNewEntity({...newEntity, name: e.target.value})}
                    className="mt-2 block w-full px-4 py-3 bg-white border border-slate-350 rounded-lg text-sm md:text-base shadow-xs focus:outline-none focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650 placeholder:text-slate-400 font-semibold text-slate-900 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Auditing Division</label>
                  <select
                    value={newEntity.auditingUnit}
                    onChange={e => setNewEntity({...newEntity, auditingUnit: e.target.value})}
                    className="mt-2 block w-full px-4 py-3 bg-white border border-slate-350 rounded-lg text-sm md:text-base shadow-xs focus:outline-none focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650 font-semibold text-slate-900 cursor-pointer transition-all"
                  >
                    {auditingUnitsList.filter(u => u.toLowerCase() !== 'follow up team').map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                  <select
                    value={newEntity.category}
                    onChange={e => {
                      const cat = e.target.value;
                      const defaultSub = subcategoriesMap[cat]?.length ? subcategoriesMap[cat][0] : '';
                      // Set default option to first available template matching category
                      const matchingTemplates = templates.filter(t => t.category === cat);
                      setNewEntity({
                        ...newEntity,
                        category: cat,
                        subcategory: defaultSub,
                        templateId: ''
                      });
                    }}
                    className="mt-2 block w-full px-4 py-3 bg-white border border-slate-350 rounded-lg text-sm md:text-base shadow-xs focus:outline-none focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650 font-semibold text-slate-900 cursor-pointer transition-all"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Sub-category</label>
                  <select
                    value={subcategoriesMap[newEntity.category]?.includes(newEntity.subcategory || '') ? newEntity.subcategory : (newEntity.subcategory ? 'custom_input_text' : '')}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === 'custom_input_text') {
                        setNewEntity({...newEntity, subcategory: ''});
                      } else {
                        setNewEntity({...newEntity, subcategory: v});
                      }
                    }}
                    className="mt-2 block w-full px-4 py-3 bg-white border border-slate-350 rounded-lg text-sm md:text-base shadow-xs focus:outline-none focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650 font-semibold text-slate-900 cursor-pointer transition-all"
                  >
                    <option value="">-- No Subcategory / Select --</option>
                    {(subcategoriesMap[newEntity.category] || []).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                    <option value="custom_input_text">-- Custom Sub-category --</option>
                  </select>
                </div>

                {(!subcategoriesMap[newEntity.category]?.includes(newEntity.subcategory || '') || newEntity.subcategory === '') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Custom Sub-category Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Cybersecurity, Operations"
                      value={newEntity.subcategory || ''}
                      onChange={e => setNewEntity({ ...newEntity, subcategory: e.target.value })}
                      className="mt-2 block w-full px-4 py-3 bg-white border border-slate-350 rounded-lg text-sm md:text-base shadow-xs focus:outline-none focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650 font-semibold text-slate-900 transition-all"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Attach Audit Checklist Template</label>
                  <select
                    value={newEntity.templateId}
                    onChange={e => setNewEntity({...newEntity, templateId: e.target.value})}
                    className="mt-2 block w-full px-4 py-3 bg-white border border-slate-350 rounded-lg text-sm md:text-base shadow-xs focus:outline-none focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650 font-semibold cursor-pointer text-indigo-805 transition-all"
                  >
                    <option value="">-- Do Not Link Template --</option>
                    {templates
                      .filter(t => t.category === newEntity.category)
                      .map(tmpl => (
                        <option key={tmpl.id} value={tmpl.id}>🔒 {tmpl.name}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3 flex justify-end gap-3.5 pt-5 border-t border-dashed border-slate-205" id="form_actions">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-3 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shadow-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-bold text-white cursor-pointer shadow-sm transition-all"
                  >
                    Register Entity
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Recycle Bin Panel */}
          {showRecycleBin && (
            <div className="bg-white p-6 rounded-xl border border-red-200 shadow-md animate-fade-in">
              <div className="flex items-center justify-between border-b border-red-100 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Trash2 className="text-red-500 w-5 h-5" /> Recycle Bin
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleEmptyRecycleBin}
                    disabled={recycledUniverse.length === 0}
                    className="flex justify-center items-center px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border border-red-200 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Empty Recycle Bin
                  </button>
                  <button onClick={() => setShowRecycleBin(false)} className="text-slate-400 hover:text-slate-655 p-1 rounded-full cursor-pointer hover:bg-slate-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {recycledUniverse.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Trash2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                  <p className="font-semibold text-sm">Recycle Bin is empty.</p>
                </div>
              ) : (
                <div className="overflow-auto max-h-[400px] border border-slate-200 rounded-xl shadow-inner bg-slate-50">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600 sticky top-0 shadow-sm">
                      <tr>
                        <th className="p-3">Entity Name</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Deleted Date (Not Persisted)</th>
                        <th className="p-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs divide-y divide-slate-100">
                      {recycledUniverse.map(item => (
                        <tr key={item.id} className="bg-white hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-semibold text-slate-900 line-through text-slate-500">{item.name}</td>
                          <td className="p-3">
                            <span className="bg-slate-200 text-slate-800 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">Recently</td>
                          <td className="p-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleRestoreEntity(item.id, item.name)}
                                className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-semibold transition-colors"
                              >
                                Restore
                              </button>
                              <button
                                onClick={() => handlePermanentlyDeleteEntity(item.id, item.name)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-lg border border-transparent hover:border-red-150 hover:bg-red-50 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Universe Table Layout */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="universe_table_card">
            <div className="p-5 border-b border-slate-150 flex justify-between items-center bg-slate-50 relative">
              <div className="flex flex-col">
                <h3 className="text-base font-bold text-slate-900">Audit Universe Registry Records</h3>
                <p className="text-xs md:text-sm text-slate-500 font-semibold mt-1">Standard catalogued items with dynamic references to specific Auditable Areas & Control Checklists.</p>
              </div>
              <div className="flex gap-2">
                {(activeRole === 'Admin' || activeRole === 'Manager') && selectedEntityIds.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="flex justify-center items-center px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800 border border-red-200 rounded-lg text-sm font-semibold transition-colors gap-2"
                    title={`Delete ${selectedEntityIds.size} Selected Entities`}
                  >
                    <Trash2 className="w-4 h-4" /> Delete {selectedEntityIds.size}
                  </button>
                )}
                {(activeRole === 'Admin' || activeRole === 'Manager') && (
                  <button
                    onClick={handleDeleteAllUniverse}
                    className="flex justify-center items-center px-4 py-2 bg-slate-100 text-red-650 hover:bg-red-600 hover:text-white border border-slate-250 hover:border-red-600 rounded-lg text-sm font-semibold transition-colors gap-2"
                    title="Delete ALL Audit Entities"
                  >
                    <Trash2 className="w-4 h-4" /> Delete All
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="universe_table_element">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={activeUniverse.length > 0 && selectedEntityIds.size === activeUniverse.length}
                        onChange={(e) => handleSelectAllEntities(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                    </th>
                    <th className="p-4">Entity Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Sub-category</th>
                    <th className="p-4">Attached Checklist Template</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs md:text-sm text-slate-805" id="universe_table_body">
                  {activeUniverse.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500 py-8">
                        No active auditable entities found. Create one or import from Excel.
                      </td>
                    </tr>
                  ) : (() => {
                    const grouped = activeUniverse.reduce((acc, item) => {
                      const unit = item.auditingUnit || 'Unassigned Division';
                      if (!acc[unit]) acc[unit] = [];
                      acc[unit].push(item);
                      return acc;
                    }, {} as Record<string, AuditUniverseEntity[]>);

                    return Object.keys(grouped).sort().map(unit => (
                      <React.Fragment key={unit}>
                        {/* Division Header Row */}
                        <tr className="bg-slate-100 border-y border-slate-200">
                          <td colSpan={6} className="p-3 px-4 font-bold text-slate-700 uppercase tracking-wider text-xs">
                            {unit} <span className="text-slate-400 font-medium ml-2">({grouped[unit].length} entities)</span>
                          </td>
                        </tr>
                        {/* Entity Rows */}
                        {grouped[unit].map(item => {
                          const linkedTemplate = templates.find(t => t.id === item.templateId);
                          const isSelected = selectedEntityIds.has(item.id);
                          return (
                            <tr key={item.id} className={`hover:bg-slate-50/50 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`} id={`ent_row_${item.id}`}>
                              <td className="p-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => handleSelectEntity(item.id, e.target.checked)}
                                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                                />
                              </td>
                              <td className="p-4 font-bold text-slate-900 text-[15px] md:text-base">
                                {item.name}
                              </td>
                              <td className="p-4">
                                <span className="text-xs md:text-sm bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md inline-block font-sans uppercase font-bold tracking-wider border border-slate-200">
                                  {item.category}
                                </span>
                              </td>
                              <td className="p-4">
                                {item.subcategory ? (
                                  <span className="text-xs md:text-sm bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md inline-block font-sans uppercase font-bold tracking-wider">
                                    {item.subcategory}
                                  </span>
                                ) : (
                                  <span className="text-slate-450 font-bold italic text-xs md:text-sm">No sub-category</span>
                                )}
                              </td>
                              <td className="p-4">
                                {linkedTemplate ? (
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-xs md:text-sm text-slate-900 font-semibold line-clamp-1">
                                      {linkedTemplate.name}
                                    </span>
                                    <button
                                      onClick={() => setInspectingTemplate(linkedTemplate)}
                                      className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100/80 text-indigo-850 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                                      title="View template auditable areas & checklist"
                                    >
                                      <Eye className="w-4 h-4" /> View Spec
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-slate-450 font-bold italic text-xs md:text-sm">Unlinked</span>
                                    <button
                                      onClick={() => setAssociatingEntity(item)}
                                      className="px-3 py-1.5 bg-slate-50 border border-slate-250 hover:bg-slate-100 text-slate-800 font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                                    >
                                      <Plus className="w-3.5 h-3.5 text-indigo-650 font-semibold" /> Link Template
                                    </button>
                                  </div>
                                )}
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex gap-2 justify-center items-center" id={`universe_row_actions_${item.id}`}>
                                  <button
                                    onClick={() => setAssociatingEntity(item)}
                                    className="text-xs md:text-sm bg-white hover:bg-slate-50 text-slate-800 font-semibold px-3 py-1.5 rounded-lg border border-slate-250 cursor-pointer transition-colors shadow-xs"
                                  >
                                    Change Link
                                  </button>
                                    
                                  {(activeRole === 'Admin' || activeRole === 'Manager') && (
                                    <>
                                      <button
                                        onClick={() => setEditingUniverseEntity(item)}
                                        className="text-indigo-650 hover:text-indigo-800 hover:bg-indigo-50 p-2 rounded-lg border border-transparent hover:border-indigo-150 transition-colors cursor-pointer animate-fade-in"
                                        title="Edit Entity"
                                      >
                                        <Edit3 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteEntity(item.id, item.name)}
                                        className="text-red-650 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg border border-transparent hover:border-red-150 transition-colors cursor-pointer animate-fade-in"
                                        title="Delete Entity"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Rich Hierarchical Checklist Template tab container */
        <div className="space-y-6" id="templates_manager_layout">
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="template_list_full_panel">
            {/* Header section with title and responsive creation action */}
            <div className="p-6 bg-slate-50/60 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1.5">
                <span className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-805 px-3 py-1 rounded font-mono font-bold uppercase tracking-wide">
                  Checklist Templates Directory
                </span>
                <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" /> Defined Reusable Category Blueprints
                </h3>
                <p className="text-xs md:text-sm text-slate-500 font-bold">
                  Review baseline checklists containing auditable areas, procedural details, and regulatory directive mappings.
                </p>
              </div>

              <div className="flex items-center gap-3.5 flex-wrap">
                <div className="text-right hidden sm:block">
                  <span className="text-xs text-slate-500 font-mono block font-bold uppercase tracking-wider">ACTIVE BLUEPRINTS</span>
                  <span className="text-sm font-sans font-semibold text-slate-700">
                    Total count: {templates.length}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowTemplateImportPanel(!showTemplateImportPanel)}
                    className={`inline-flex items-center gap-2 font-semibold text-sm px-4 py-3 rounded-lg transition-all cursor-pointer border ${showTemplateImportPanel ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-250 text-slate-800 hover:bg-slate-50 shadow-sm'}`}
                    title="Import via Excel/CSV"
                  >
                    <Upload className="w-4 h-4" /> Import CSV
                  </button>
                  <button
                    type="button"
                    onClick={handleInitiateCreateTemplate}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-3 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-md animate-fade-in"
                    id="btn_create_new_template"
                  >
                    <Plus className="w-5 h-5" /> Create New Template
                  </button>
                </div>
              </div>
            </div>

            {/* Template Bulk Import / Excel Integration Panel */}
            {showTemplateImportPanel && (
              <div className="bg-white p-6 border-b border-slate-200 border-x-0 border-t-0 space-y-6 animate-fade-in bg-slate-50/50">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <Upload className="w-5 h-5" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Bulk Template Uploader</h3>
                  </div>
                  <button
                    onClick={downloadTemplateCSVTemplate}
                    className="text-xs bg-white text-indigo-600 font-bold px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors shadow-xs"
                  >
                    Download CSV Template
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Upload Split */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Option A: Upload File</label>
                    <div 
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${templateDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-white'}`}
                      onDragEnter={handleTemplateDrag}
                      onDragOver={handleTemplateDrag}
                      onDragLeave={handleTemplateDrag}
                      onDrop={handleTemplateDrop}
                    >
                      <Upload className="w-8 h-8 text-indigo-400 mb-3 mx-auto" />
                      <p className="text-sm font-semibold text-slate-700 mb-1">Drag and drop your template CSV here</p>
                      <p className="text-xs text-slate-500 mb-4">Must include Template Name and Category columns.</p>
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls,.txt,.tsv"
                        className="hidden"
                        id="templateFileInput"
                        onChange={handleTemplateFileChange}
                      />
                      <label 
                        htmlFor="templateFileInput"
                        className="bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 font-bold py-2 px-4 rounded-lg cursor-pointer text-xs"
                      >
                        Browse Computer
                      </label>
                    </div>
                  </div>

                  {/* Paste Split */}
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Option B: Copy / Paste Excel Data</label>
                    <textarea 
                      className="w-full h-[180px] p-3 text-xs md:text-sm border border-slate-250 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono shadow-inner bg-white leading-relaxed whitespace-pre"
                      placeholder="Paste columns from Excel here...&#10;&#10;Template Name&#9;Category&#9;Area Name..."
                      onChange={(e) => {
                        const val = e.target.value;
                        const isTSV = val.includes('\t');
                        const parsed = isTSV ? parseTSV(val) : parseCSV(val);
                        handleTemplateParseData(parsed);
                      }}
                    ></textarea>
                  </div>
                </div>

                {templateImportErrors.length > 0 && (
                  <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200 shadow-sm text-sm">
                    <span className="font-bold flex items-center gap-2 mb-2"><AlertCircle className="w-4 h-4" /> Parsing Warnings:</span>
                    <ul className="list-disc pl-5 space-y-1">
                      {templateImportErrors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {parsedTemplatePreview.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-end border-b border-slate-200 pb-2">
                      <label className="block text-sm font-bold text-slate-900">Parsed Preview ({parsedTemplatePreview.length} templates)</label>
                      <button 
                        onClick={saveImportedTemplates}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm shadow-md transition-colors cursor-pointer flex items-center gap-2"
                      >
                        <CheckSquare className="w-4 h-4" /> Import {parsedTemplatePreview.length} Templates
                      </button>
                    </div>
                    <div className="max-h-[300px] overflow-auto border border-slate-200 rounded-xl bg-white shadow-inner">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600 sticky top-0 shadow-sm">
                          <tr>
                            <th className="p-3">Template Name</th>
                            <th className="p-3">Category</th>
                            <th className="p-3">Description</th>
                            <th className="p-3">Auditable Areas</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs md:text-sm divide-y divide-slate-100">
                          {parsedTemplatePreview.map((item, i) => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                              <td className="p-3">
                                <span className="bg-slate-200 text-slate-800 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide">
                                  {item.category}
                                </span>
                              </td>
                              <td className="p-3 text-slate-600 truncate max-w-[200px]">{item.description}</td>
                              <td className="p-3 text-emerald-650 font-bold font-mono text-[11px] bg-emerald-50 text-center">
                                {item.auditableAreas.length} parsed
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {templates.length === 0 ? (
              <div className="p-16 text-center text-slate-400 space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-350">
                  <AlertCircle className="w-8 h-8 opacity-65" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold font-mono text-slate-800">No Reusable Checklist Templates Found</p>
                  <p className="text-xs md:text-sm text-slate-450 max-w-md mx-auto">Create a master Checklist Template blueprint containing auditable focus zones and regulatory check criteria checklists to get started.</p>
                </div>
                <button
                  type="button"
                  onClick={handleInitiateCreateTemplate}
                  className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-150 text-indigo-700 font-bold text-xs px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Initialize First Checklist Template
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs md:text-sm" id="templates_tabular_table">
                  <thead className="bg-slate-50/50 text-xs font-bold text-slate-600 uppercase tracking-wider border-b border-slate-20 border-slate-150">
                    <tr>
                      <th className="px-6 py-4">Checklist Template Name & Overview</th>
                      <th className="px-6 py-4">Audit Category Segment</th>
                      <th className="px-6 py-4 text-center">Structure Specs</th>
                      <th className="px-6 py-4 text-center flex-shrink-0">Linked Registry Records</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 bg-white">
                    {templates.map(tmpl => {
                      const associatedEntitiesCount = universe.filter(ent => ent.templateId === tmpl.id).length;
                      const totalChecklistCount = tmpl.auditableAreas.reduce((cnt, area) => cnt + (area.checklist?.length || 0), 0);
                      
                      return (
                        <tr key={tmpl.id} className="hover:bg-slate-50/30 transition-colors" id={`tbl_tmpl_row_${tmpl.id}`}>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-905 text-sm md:text-base tracking-tight truncate max-w-[320px]" title={tmpl.name}>
                              {tmpl.name}
                            </div>
                            {tmpl.description && (
                              <div className="text-xs text-slate-500 font-bold italic truncate max-w-[320px] mt-1" title={tmpl.description}>
                                {tmpl.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-3 py-1.5 rounded bg-indigo-50 border border-indigo-100 text-indigo-850 font-semibold tracking-wider text-xs uppercase font-mono">
                              {tmpl.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap font-semibold text-slate-600 text-xs md:text-sm">
                            <span className="text-indigo-650 font-mono font-bold text-sm">{tmpl.auditableAreas.length}</span> Areas
                            <span className="mx-2.5 text-slate-300">|</span>
                            <span className="text-emerald-850 font-mono font-bold text-sm">{totalChecklistCount}</span> Control Rules
                          </td>
                          <td className="px-6 py-4 text-center whitespace-nowrap font-semibold text-slate-600">
                            <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-semibold ${associatedEntitiesCount > 0 ? 'bg-emerald-50 border border-emerald-250 text-emerald-850' : 'bg-slate-100 border border-slate-250 text-slate-600'}`}>
                              ⛓️ {associatedEntitiesCount} Linked Records
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right whitespace-nowrap space-x-1 px-4">
                            <button
                              type="button"
                              onClick={() => setEditingTemplate(JSON.parse(JSON.stringify(tmpl)))}
                              className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-250 text-indigo-850 font-semibold text-xs md:text-sm px-4 py-2 rounded-lg transition-all cursor-pointer shadow-xs"
                              title="View details, edit template, add checklists or areas"
                            >
                              <Eye className="w-4 h-4 text-indigo-600" /> View & Edit Details
                            </button>
                            
                            {(activeRole === 'Admin' || activeRole === 'Manager') && (
                              <button
                                type="button"
                                onClick={() => handleDeleteTemplate(tmpl.id, tmpl.name)}
                                className="p-2 text-red-650 hover:text-red-800 hover:bg-red-50 border border-transparent hover:border-red-150 rounded-lg transition-colors cursor-pointer inline-flex items-center"
                                title="Delete this Checklist Template"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}
      </>
      ) : editingTemplate ? (
        /* Detailed Template Inspector & Full-Spec Editor - Now Rendered as a Full Page! */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-fade-in" id="edit_template_spec_page">
          
          {/* Page Header */}
          <div className="p-5 bg-indigo-950 text-white flex justify-between items-start flex-shrink-0">
            <div className="space-y-1">
              <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[9px] font-bold uppercase tracking-wider font-mono border border-indigo-400/15">
                {templates.some(t => t.id === editingTemplate.id) ? "Checklist Template Inspector & Editor" : "Checklist Template Designer & Creator"}
              </span>
              <h3 className="text-base font-bold mt-1 text-white tracking-tight">
                {templates.some(t => t.id === editingTemplate.id) ? "Modify Blueprint: " : "Create Brand New Blueprint: "} <span className="text-indigo-200">{editingTemplate.name}</span>
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                {templates.some(t => t.id === editingTemplate.id) 
                  ? "Add or edit auditable areas and control testing templates in real-time. Link changes directly to matching registry records."
                  : "Design your multi-level blueprint: Set category segment, define auditable areas, and design control testing checklists."
                }
              </p>
            </div>
            <button 
              onClick={() => {
                showConfirm("Are you sure you want to discard your draft edits?", () => {
                  setEditingTemplate(null);
                });
              }} 
              className="inline-flex items-center gap-1.5 p-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer text-xs font-bold"
              title="Discard draft and go back"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
            </button>
          </div>

            {/* Modal Scrollable Content Container */}
            <div className="p-6 space-y-6 overflow-y-auto flex-grow bg-slate-50/50">
              
              {/* Part A: Primary Template Meta Information */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" /> 1. General Checklist Template
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Template Title</label>
                    <input
                      type="text"
                      required
                      value={editingTemplate.name}
                      onChange={e => {
                        const val = e.target.value;
                        setEditingTemplate(prev => prev ? { ...prev, name: val } : null);
                      }}
                      className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all font-sans"
                      placeholder="e.g. IT Security Applications Blueprint"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Category Segment</label>
                    <select
                      value={editingTemplate.category}
                      onChange={e => {
                        const val = e.target.value;
                        setEditingTemplate(prev => prev ? { ...prev, category: val } : null);
                      }}
                      className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold cursor-pointer text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all font-sans"
                    >
                      {categoriesList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Description / Standard references</label>
                  <textarea
                    rows={2}
                    value={editingTemplate.description}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingTemplate(prev => prev ? { ...prev, description: val } : null);
                    }}
                    className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:outline-none focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650 transition-all font-sans"
                    placeholder="Summarize objectives, requirements, benchmarks..."
                  />
                </div>
              </div>

              {/* Part B: Auditable Areas Hierarchy Section */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-indigo-600" /> 2. Auditable Areas Hierarchy ({editingTemplate.auditableAreas.length})
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadTemplateChecklistCSV}
                      className="text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV Format
                    </button>
                    <label className="text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5" /> Upload CSV
                      <input type="file" accept=".csv" onChange={handleUploadTemplateChecklistCSV} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const newArea: AuditableArea = {
                          id: `area-${Date.now()}`,
                          name: '',
                          description: '',
                          checklist: []
                        };
                        setEditingTemplate(prev => prev ? {
                          ...prev,
                          auditableAreas: [...prev.auditableAreas, newArea]
                        } : null);
                      }}
                      className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-md transition-colors cursor-pointer"
                    >
                      + Add Auditable Area Block
                    </button>
                  </div>
                </div>

                {editingTemplate.auditableAreas.length === 0 ? (
                  <div className="p-8 border border-dashed rounded-xl bg-white text-center text-xs text-slate-400 italic">
                    No Auditable Areas attached. Add at least one auditable area zone.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {editingTemplate.auditableAreas.map((area, areaIdx) => (
                      <div key={area.id} className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-xs relative" id={`edit_area_block_${area.id}`}>
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                          <span className="text-[10px] font-semibold text-slate-500 font-mono tracking-wider">
                            AREA BLOCK #{areaIdx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTemplate(prev => prev ? {
                                ...prev,
                                auditableAreas: prev.auditableAreas.filter(a => a.id !== area.id)
                              } : null);
                            }}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 text-[10px] font-bold px-2 py-0.5 rounded transition-all cursor-pointer"
                          >
                            Remove This Area
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Auditable Area Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Identity Management & MFA Access"
                              value={area.name}
                              onChange={e => {
                                const val = e.target.value;
                                setEditingTemplate(prev => {
                                  if (!prev) return null;
                                  return {
                                    ...prev,
                                    auditableAreas: prev.auditableAreas.map(a => a.id === area.id ? { ...a, name: val } : a)
                                  };
                                });
                              }}
                              className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650 rounded-lg text-sm placeholder:text-slate-400 font-semibold text-slate-900 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Scope Description</label>
                            <input
                              type="text"
                              placeholder="Describe the scope & regulatory standard mapping limits..."
                              value={area.description}
                              onChange={e => {
                                const val = e.target.value;
                                setEditingTemplate(prev => {
                                  if (!prev) return null;
                                  return {
                                    ...prev,
                                    auditableAreas: prev.auditableAreas.map(a => a.id === area.id ? { ...a, description: val } : a)
                                  };
                                });
                              }}
                              className="mt-1 block w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-indigo-650 focus:ring-1 focus:ring-indigo-650 rounded-lg text-sm placeholder:text-slate-400 font-medium text-slate-800 transition-all"
                            />
                          </div>
                        </div>

                        {/* Nested Checklist Block inside each area */}
                        <div className="space-y-3 pt-3 border-t border-slate-100">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> Controls & Testing Checklist ({area.checklist?.length || 0})
                              </span>
                              {area.checklist && area.checklist.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => toggleAreaChecklist(area.id)}
                                  className="text-[9px] bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 px-2 py-0.5 rounded cursor-pointer font-bold inline-flex items-center gap-1 transition-all"
                                >
                                  {collapsedAreas[area.id] ? <ChevronDown className="w-3 h-3 text-indigo-600" /> : <ChevronUp className="w-3 h-3 text-slate-500" />}
                                  <span>{collapsedAreas[area.id] ? "Show Checklist" : "Hide Checklist"}</span>
                                </button>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newItem: ChecklistItem = {
                                  id: `chk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                                  name: '',
                                  description: '',
                                  testProcedures: '',
                                  controlType: 'Standard',
                                  complianceRef: ''
                                };
                                setEditingTemplate(prev => {
                                  if (!prev) return null;
                                  return {
                                    ...prev,
                                    auditableAreas: prev.auditableAreas.map(a => {
                                      if (a.id === area.id) {
                                        return {
                                          ...a,
                                          checklist: [...(a.checklist || []), newItem]
                                        };
                                      }
                                      return a;
                                    })
                                  };
                                });
                                // Auto expand on add
                                setCollapsedAreas(prev => ({ ...prev, [area.id]: false }));
                              }}
                              className="text-[9px] bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-800 font-semibold px-1.5 py-0.5 rounded cursor-pointer transition-all"
                            >
                              + Add Checklist Item
                            </button>
                          </div>

                          {collapsedAreas[area.id] ? (
                            <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-200/40 text-[10px] text-slate-600 text-center font-bold tracking-tight">
                              Checklist is collapsed ({area.checklist?.length || 0} checks). Click "Show Checklist" to expand and edit.
                            </div>
                          ) : (!area.checklist || area.checklist.length === 0) ? (
                            <div className="p-3 bg-slate-50 border border-dashed rounded text-[10px] text-slate-400 text-center italic">
                              No checklist controls attached to this Area yet. Click "+ Add Checklist Item" above.
                            </div>
                          ) : (
                            <div className="space-y-2.5 pl-3 border-l-2 border-slate-250">
                              {area.checklist.map((c, chkIdx) => (
                                <div key={c.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-200 relative shadow-xs space-y-2">
                                  <div className="flex justify-between items-center pb-1 border-b border-slate-200/50">
                                    <span className="text-[9px] font-semibold text-slate-450 uppercase font-mono">Control Check #{chkIdx + 1}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingTemplate(prev => {
                                          if (!prev) return null;
                                          return {
                                            ...prev,
                                            auditableAreas: prev.auditableAreas.map(a => {
                                              if (a.id === area.id) {
                                                return {
                                                  ...a,
                                                  checklist: a.checklist.filter(chk => chk.id !== c.id)
                                                };
                                              }
                                              return a;
                                            })
                                          };
                                        });
                                      }}
                                      className="text-red-500 hover:text-red-750 font-bold text-[10px] cursor-pointer"
                                    >
                                      Delete Check
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Control name</label>
                                      <input
                                        type="text"
                                        required
                                        placeholder="Control target (e.g. Audit Logs Verification)"
                                        value={c.name}
                                        onChange={e => {
                                          const v = e.target.value;
                                          setEditingTemplate(prev => {
                                            if (!prev) return null;
                                            return {
                                              ...prev,
                                              auditableAreas: prev.auditableAreas.map(a => a.id === area.id ? {
                                                ...a,
                                                checklist: a.checklist.map(chk => chk.id === c.id ? { ...chk, name: v } : chk)
                                              } : a)
                                            };
                                          });
                                        }}
                                        className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm placeholder:text-slate-400 font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-none focus:border-indigo-500 font-sans transition-all"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Description / Objective</label>
                                      <input
                                        type="text"
                                        placeholder="Goal / Description"
                                        value={c.description}
                                        onChange={e => {
                                          const v = e.target.value;
                                          setEditingTemplate(prev => {
                                            if (!prev) return null;
                                            return {
                                              ...prev,
                                              auditableAreas: prev.auditableAreas.map(a => a.id === area.id ? {
                                                ...a,
                                                checklist: a.checklist.map(chk => chk.id === c.id ? { ...chk, description: v } : chk)
                                              } : a)
                                            };
                                          });
                                        }}
                                        className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm placeholder:text-slate-400 font-medium text-slate-800 focus:ring-1 focus:ring-indigo-600 focus:outline-none focus:border-indigo-500 font-sans transition-all"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Test Procedures / Audit Instructions</label>
                                    <textarea
                                      rows={1}
                                      placeholder="Test procedures and physical work instruction steps..."
                                      value={c.testProcedures}
                                      onChange={e => {
                                        const v = e.target.value;
                                        setEditingTemplate(prev => {
                                          if (!prev) return null;
                                          return {
                                            ...prev,
                                            auditableAreas: prev.auditableAreas.map(a => a.id === area.id ? {
                                              ...a,
                                              checklist: a.checklist.map(chk => chk.id === c.id ? { ...chk, testProcedures: v } : chk)
                                            } : a)
                                          };
                                        });
                                      }}
                                      className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm placeholder:text-slate-400 font-medium text-slate-750 focus:ring-1 focus:ring-indigo-600 focus:outline-none focus:border-indigo-500 font-sans transition-all"
                                    />
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <span className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Control Type</span>
                                      <select
                                        value={c.controlType}
                                        onChange={e => {
                                          const v = e.target.value as any;
                                          setEditingTemplate(prev => {
                                            if (!prev) return null;
                                            return {
                                              ...prev,
                                              auditableAreas: prev.auditableAreas.map(a => a.id === area.id ? {
                                                ...a,
                                                checklist: a.checklist.map(chk => chk.id === c.id ? { ...chk, controlType: v } : chk)
                                              } : a)
                                            };
                                          });
                                        }}
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 cursor-pointer focus:ring-1 focus:ring-indigo-600 focus:outline-none focus:border-indigo-500 font-sans transition-all"
                                      >
                                        <option value="Key">Key</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Automated">Automated</option>
                                        <option value="Manual">Manual</option>
                                      </select>
                                    </div>
                                    <div>
                                      <span className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">Compliance / NBE Ref</span>
                                      <input
                                        type="text"
                                        placeholder="Directive / Section..."
                                        value={c.complianceRef || ''}
                                        onChange={e => {
                                          const v = e.target.value;
                                          setEditingTemplate(prev => {
                                            if (!prev) return null;
                                            return {
                                              ...prev,
                                              auditableAreas: prev.auditableAreas.map(a => a.id === area.id ? {
                                                ...a,
                                                checklist: a.checklist.map(chk => chk.id === c.id ? { ...chk, complianceRef: v } : chk)
                                              } : a)
                                            };
                                          });
                                        }}
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm placeholder:text-slate-400 font-semibold text-slate-900 focus:ring-1 focus:ring-indigo-600 focus:outline-none focus:border-indigo-500 font-sans transition-all"
                                      />
                                    </div>
                                  </div>

                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-250 flex justify-between items-center flex-shrink-0" id="edit_modal_footer_buttons">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    showConfirm("Are you sure you want to discard your draft edits?", () => {
                      setEditingTemplate(null);
                    });
                  }}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-bold cursor-pointer transition-colors"
                >
                  Discard Edits
                </button>
                {templates.some(t => t.id === editingTemplate.id) && (activeRole === 'Admin' || activeRole === 'Manager') && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteTemplate(editingTemplate.id, editingTemplate.name);
                      setEditingTemplate(null);
                    }}
                    className="px-4 py-2 text-red-650 hover:bg-red-50 hover:text-red-700 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors border border-transparent hover:border-red-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Template
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!editingTemplate.name.trim()) {
                    showAlert("Please Please provide a Checklist Template name.");
                    return;
                  }

                  // Process and clean fields for persistence
                  const cleanedAreas = editingTemplate.auditableAreas.map(area => {
                    const cleanName = area.name.trim() || 'General Unit Assessment';
                    const cleanChecklist = (area.checklist || []).filter(c => c.name.trim() !== '').map(c => ({
                      ...c,
                      name: c.name.trim(),
                      description: c.description.trim() || 'Standard compliance and internal safety checklist controls evaluation procedures.',
                      testProcedures: c.testProcedures.trim() || 'Examine standard system settings and supervisory authorization logs.',
                    }));

                    return {
                      ...area,
                      name: cleanName,
                      description: area.description.trim() || 'Auditable target focus control scope guidelines.',
                      checklist: cleanChecklist
                    };
                  });

                  const updatedTemplate: CategoryTemplate = {
                    ...editingTemplate,
                    name: editingTemplate.name.trim(),
                    description: editingTemplate.description.trim(),
                    auditableAreas: cleanedAreas
                  };

                  const isNew = !templates.some(t => t.id === updatedTemplate.id);
                  let updatedList;
                  if (isNew) {
                    updatedList = [...templates, updatedTemplate];
                    onLogAction('Checklist Template Created', `Created Checklist Template "${updatedTemplate.name}" under category: ${updatedTemplate.category}`);
                  } else {
                    updatedList = templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t);
                    onLogAction('Checklist Template Updated', `Modified Checklist Template: "${updatedTemplate.name}"`);
                  }
                  
                  updateTemplatesList(updatedList);
                  setEditingTemplate(null);
                  showAlert(isNew ? `Successfully created Checklist Template: "${updatedTemplate.name}"!` : `Successfully updated Checklist Template: "${updatedTemplate.name}"!`);
                }}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                {templates.some(t => t.id === editingTemplate.id) ? "Save Blueprint Changes" : "Create Master Blueprint Template"}
              </button>
            </div>

          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col animate-fade-in" id="inspect_template_spec_page">
          
          {/* Page Header */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex justify-between items-start flex-shrink-0">
            <div className="space-y-1">
              <span className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[9px] font-bold uppercase tracking-wider font-mono border border-indigo-500/25">
                Category: {inspectingTemplate.category}
              </span>
              <h3 className="text-base font-bold mt-1 text-white tracking-tight">{inspectingTemplate.name}</h3>
              {inspectingTemplate.description && (
                <p className="text-[11px] text-slate-300 mt-0.5 italic">
                  {inspectingTemplate.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {(activeRole === 'Admin' || activeRole === 'Manager') && (
                <button
                  onClick={() => {
                    handleDeleteTemplate(inspectingTemplate.id, inspectingTemplate.name);
                    setInspectingTemplate(null);
                  }}
                  className="inline-flex items-center gap-1.5 p-1.5 px-3 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-100 border border-red-500/30 transition-colors cursor-pointer text-xs font-bold"
                  title="Permanently remove this Checklist Template"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              )}
              <button 
                onClick={() => setInspectingTemplate(null)} 
                className="inline-flex items-center gap-1.5 p-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer text-xs font-bold"
                title="Go back to the main directory list"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
              </button>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6 space-y-6 bg-slate-50/50">
            {inspectingTemplate.auditableAreas.map((area, areaIdx) => (
              <div key={area.id || areaIdx} className="space-y-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
                <div className="border-b border-slate-200 pb-2.5">
                  <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase tracking-wider">
                    Auditable Area #{areaIdx + 1}
                  </span>
                  <h4 className="text-[14px] font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Layers className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    {area.name}
                  </h4>
                  {area.description && (
                    <p className="text-[11px] text-slate-500 mt-1 pl-5 italic leading-relaxed">
                      {area.description}
                    </p>
                  )}
                </div>

                {/* Checklist of controls in this area */}
                <div className="space-y-2.5 pl-5">
                  <div className="flex justify-between items-center gap-2 border-b border-slate-150 pb-1.5">
                    <div className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-650" /> Controls & Testing Checklist ({area.checklist?.length || 0})
                    </div>
                    {area.checklist && area.checklist.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleAreaChecklist(area.id || areaIdx.toString())}
                        className="text-[9px] bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 px-2 py-0.5 rounded cursor-pointer font-bold inline-flex items-center gap-1 transition-all"
                      >
                        {collapsedAreas[area.id || areaIdx.toString()] ? <ChevronDown className="w-3 h-3 text-indigo-600" /> : <ChevronUp className="w-3 h-3 text-slate-500" />}
                        <span>{collapsedAreas[area.id || areaIdx.toString()] ? "Show" : "Hide"} Checklist</span>
                      </button>
                    )}
                  </div>

                  {collapsedAreas[area.id || areaIdx.toString()] ? (
                    <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-200/30 text-[11px] text-slate-600 text-center font-bold tracking-tight">
                      Checklist is collapsed. Click "Show Checklist" to expand the testing controls.
                    </div>
                  ) : area.checklist && area.checklist.length > 0 ? (
                    <div className="space-y-3">
                      {area.checklist.map((chk, chkIdx) => (
                        <div key={chk.id || chkIdx} className="p-3.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs space-y-2 text-slate-850 shadow-xs">
                          <div className="flex justify-between items-start gap-3 flex-wrap">
                            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span className="w-4 h-4 bg-emerald-100 text-emerald-850 rounded-full flex items-center justify-center font-mono text-[9px] font-bold">
                                {chkIdx + 1}
                              </span>
                              {chk.name}
                            </span>
                            <div className="flex gap-1.5 items-center">
                              <span className="text-[8px] bg-slate-100 border border-slate-250 text-slate-700 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                                Type: {chk.controlType}
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-650 leading-relaxed pl-5">
                            <strong className="text-slate-800 font-bold">Objective: </strong>{chk.description}
                          </p>

                          <div className="p-2.5 bg-white rounded border border-slate-200 text-[10px] leading-relaxed pl-3 italic text-indigo-900">
                            <strong className="text-slate-700 font-mono font-semibold block uppercase tracking-wider text-[8px] not-italic mb-0.5">Test Procedures:</strong>
                            {chk.testProcedures}
                          </div>

                          {chk.complianceRef && (
                            <div className="text-[8px] font-mono text-slate-400 pl-5 flex items-center gap-1 leading-none select-none">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Regulatory Guidelines / Compliance Benchmark: <strong className="text-slate-600 font-semibold">{chk.complianceRef}</strong>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">No checklist elements provided for this auditable target zone.</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Page Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            {(activeRole === 'Admin' || activeRole === 'Manager') && (
              <button
                onClick={() => {
                  handleDeleteTemplate(inspectingTemplate.id, inspectingTemplate.name);
                  setInspectingTemplate(null);
                }}
                className="px-4 py-2 text-red-650 hover:bg-red-50 hover:text-red-700 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors border border-transparent hover:border-red-100"
              >
                <Trash2 className="w-3.5 h-3.5" /> Permanently Delete This Template
              </button>
            )}
            <button
              onClick={() => setInspectingTemplate(null)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-950 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Close and Return to Registry
            </button>
          </div>

        </div>
      )}

      {/* Associate/Change Template Link overlay */}
      {associatingEntity && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="link_template_modal">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-indigo-600" /> Attach Checklist Template to Entity
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Attach a Checklist Template matching category <strong className="text-indigo-605 font-semibold uppercase">{associatingEntity.category}</strong>.
              </p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-150">
                <span className="text-[10px] text-slate-400 font-mono font-bold block uppercase">Active Audit Entity</span>
                <span className="text-xs font-semibold text-slate-900 block">{associatingEntity.name}</span>
                <span className="text-[10px] text-slate-550 block font-medium mt-0.5">Category: {associatingEntity.category} ({associatingEntity.subcategory || 'General'})</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Reusable Template</label>
                <select
                  id="template_select_dropdown"
                  defaultValue={associatingEntity.templateId || ''}
                  onChange={e => handleConfirmTemplateAttachment(e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-xs font-bold focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium cursor-pointer text-indigo-700"
                >
                  <option value="">-- No Attached Template / Clear Link --</option>
                  {templates
                    .filter(t => t.category === associatingEntity.category)
                    .map(tmpl => {
                      const checkCount = tmpl.auditableAreas.reduce((sum, area) => sum + (area.checklist?.length || 0), 0);
                      return (
                        <option key={tmpl.id} value={tmpl.id}>🔒 {tmpl.name} ({tmpl.auditableAreas.length} Areas / {checkCount} Controls)</option>
                      );
                    })}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Only Checklist Templates designed for Category "{associatingEntity.category}" are recommended.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100" id="link_actions">
              <button
                type="button"
                onClick={() => setAssociatingEntity(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel Linkage
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editing Entity overlay */}
      {editingUniverseEntity && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="edit_entity_modal">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4 animate-scale-up">
            <div className="pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-indigo-600" /> Edit Audit Universe Entity
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Entity Name</label>
                <input
                  type="text"
                  value={editingUniverseEntity.name}
                  onChange={(e) => setEditingUniverseEntity({ ...editingUniverseEntity, name: e.target.value })}
                  className="block w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
                <select
                  value={editingUniverseEntity.category}
                  onChange={(e) => {
                    const cat = e.target.value;
                    setEditingUniverseEntity({ ...editingUniverseEntity, category: cat, subcategory: subcategoriesMap[cat]?.length ? subcategoriesMap[cat][0] : '' });
                  }}
                  className="block w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium"
                >
                  {categoriesList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subcategory</label>
                <select
                  value={subcategoriesMap[editingUniverseEntity.category]?.includes(editingUniverseEntity.subcategory || '') ? editingUniverseEntity.subcategory : (editingUniverseEntity.subcategory ? 'custom_input_text' : '')}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === 'custom_input_text') {
                      setEditingUniverseEntity({ ...editingUniverseEntity, subcategory: '' });
                    } else {
                      setEditingUniverseEntity({ ...editingUniverseEntity, subcategory: v });
                    }
                  }}
                  className="block w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium"
                >
                  <option value="">-- No Subcategory / Select --</option>
                  {(subcategoriesMap[editingUniverseEntity.category] || []).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                  <option value="custom_input_text">-- Custom Sub-category --</option>
                </select>

                {(!subcategoriesMap[editingUniverseEntity.category]?.includes(editingUniverseEntity.subcategory || '') || editingUniverseEntity.subcategory === '') && (
                  <input
                    type="text"
                    value={editingUniverseEntity.subcategory || ''}
                    placeholder="Enter custom subcategory"
                    onChange={(e) => setEditingUniverseEntity({ ...editingUniverseEntity, subcategory: e.target.value })}
                    className="mt-2 block w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium"
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Auditing Unit</label>
                <select
                  value={editingUniverseEntity.auditingUnit || ''}
                  onChange={(e) => setEditingUniverseEntity({ ...editingUniverseEntity, auditingUnit: e.target.value })}
                  className="block w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium"
                >
                  <option value="" disabled>Select Division...</option>
                  {Array.from(new Set([...auditingUnitsList.filter(u => u.toLowerCase() !== 'follow up team'), editingUniverseEntity.auditingUnit].filter(Boolean))).map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  value={editingUniverseEntity.description || ''}
                  onChange={(e) => setEditingUniverseEntity({ ...editingUniverseEntity, description: e.target.value })}
                  rows={3}
                  className="block w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100" id="edit_actions">
              <button
                type="button"
                onClick={() => setEditingUniverseEntity(null)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!editingUniverseEntity.name.trim()) return;
                  const updatedUniverse = universe.map(ent => ent.id === editingUniverseEntity.id ? editingUniverseEntity : ent);
                  onUpdateUniverse(updatedUniverse);
                  onLogAction('Edit Entity', `Edited entity "${editingUniverseEntity.name}" in the Audit Universe.`);
                  setEditingUniverseEntity(null);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Dialog */}
      {alertDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-scale-up space-y-4">
            <h3 className="font-bold border-b border-slate-100 pb-2 text-slate-900">Notice</h3>
            <p className="text-sm text-slate-700">{alertDialog.message}</p>
            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setAlertDialog({ isOpen: false, message: '' })}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-5 rounded-lg transition-colors text-sm"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirm Dialog */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-scale-up space-y-4">
            <h3 className="font-bold border-b border-slate-100 pb-2 text-slate-900">Confirm Action</h3>
            <p className="text-sm text-slate-700 font-medium">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setConfirmDialog({ isOpen: false, message: '', onConfirm: null })}
                className="px-4 py-2 border border-slate-300 rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (confirmDialog.onConfirm) confirmDialog.onConfirm();
                  setConfirmDialog({ isOpen: false, message: '', onConfirm: null });
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-5 rounded-lg transition-colors text-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
