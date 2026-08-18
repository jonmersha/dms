/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuditContext } from "../context/AuditContext";
import { 
  Plus, 
  Trash2, 
  Edit3,
  Sliders, 
  PlusCircle, 
  Check, 
  CheckSquare, 
  HelpCircle, 
  Briefcase, 
  ArrowRightLeft, 
  Award,
  AlertTriangle,
  Lock,
  CalendarDays,
  Sparkles,
  Settings,
  Calculator,
  Grid,
  ShieldAlert,
  Info,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Save,
  Loader2,
  CheckCircle2,
  FileText,
  Printer,
  X
} from 'lucide-react';
import { 
  AuditUniverseEntity, 
  AnnualPlanItem, 
  UserRole 
} from '../types';

interface RiskAssessmentViewProps {
  targetModule?: 'RiskAssessment' | 'AnnualPlan';
}

export interface RiskFactor {
  id: string;
  name: string;
  category: 'Impact' | 'Likelihood';
  weight: number; // percentage (typically 0-100)
  description: string;
  applicableCategories?: string[]; // Empty or contains specific universe categories. If empty, applies to ALL.
}

export interface RiskLevelConfig {
  id: string;
  name: string;
  minScore: number;
  maxScore: number;
  bgColor: string;
  textColor: string;
}

export default function RiskAssessmentView({
  targetModule
}: RiskAssessmentViewProps) {
  const { universe, setUniverse: onUpdateUniverse, annualPlan, setAnnualPlan: onUpdateAnnualPlan, activeRole, handleLogSystemAction: onLogAction } = useAuditContext();

  
  // Outer Tabs: 'Matrix' (Interactive Matrix composed of universe & factor rates), 'Setup' (Define factors and levels), and 'Plan' (Annual Work Plan Calendar)
  const [activeSubTab, setActiveSubTab] = useState<'Matrix' | 'Setup' | 'Plan'>(targetModule === 'AnnualPlan' ? 'Plan' : 'Setup');
  
  useEffect(() => {
    setActiveSubTab(targetModule === 'AnnualPlan' ? 'Plan' : 'Setup');
  }, [targetModule]);

  // Search Filter state inside risk matrix view
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  // Explicit saving interplay
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  const handleManualSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setShowSavedMsg(true);
      setTimeout(() => setShowSavedMsg(false), 2000);
    }, 600);
  };

  // --- ASSESSMENT YEARS CONTROL HUB STATE ---
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [availableYears, setAvailableYears] = useState<string[]>(() => {
    const cached = localStorage.getItem('audit_available_years');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return ['2025', '2026', '2027'];
  });

  // --- DYNAMIC STATE 1: DEFINE RISK FACTORS BY YEAR ---
  const [riskFactorsByYear, setRiskFactorsByYear] = useState<Record<string, RiskFactor[]>>(() => {
    const cached = localStorage.getItem('audit_custom_risk_factors_by_year_v2');
    
    // Seed defaults for the new audit groups
    const defaultFactors: RiskFactor[] = [];
    
        if (cached) {
      try { 
         const parsed = JSON.parse(cached); 
         // auto-migrate old names to divisions
         const migrated: Record<string, RiskFactor[]> = {};
         
         Object.keys(parsed).forEach(yr => {
             migrated[yr] = parsed[yr]
               .map((f: RiskFactor) => {
                 let ac = f.applicableCategories?.map(c => {
                     if (c === 'IT Audit') return 'IT Audit Division';
                     if (c === 'Branch Audit') return 'Branch Audit Division';
                     if (c === 'Corporate Audit') return 'Financial & Ops Section'; 
                     return c;
                 });
                 return { ...f, applicableCategories: ac || [] };
             });
         });
         return migrated;
      } catch (e) {}
    }

    return {
      '2025': defaultFactors,
      '2026': defaultFactors,
      '2027': defaultFactors
    };
  });

  // --- DYNAMIC STATE 2: DEFINE RISK LEVELS & THRESHOLDS ---
  const [riskLevels, setRiskLevels] = useState<RiskLevelConfig[]>(() => {
    const cached = localStorage.getItem('audit_custom_risk_levels');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return [
      { id: 'rl-low', name: 'Low Risk', minScore: 1.0, maxScore: 2.3, bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200', textColor: 'text-emerald-700' },
      { id: 'rl-medium', name: 'Medium Risk', minScore: 2.3, maxScore: 3.4, bgColor: 'bg-amber-50 text-amber-900 border-amber-200', textColor: 'text-amber-700' },
      { id: 'rl-high', name: 'High Risk', minScore: 3.4, maxScore: 5.0, bgColor: 'bg-rose-50 text-rose-900 border-rose-200', textColor: 'text-rose-700' }
    ];
  });

  // --- DYNAMIC STATE 3: FORMING OF MATRIX MAPPED BY YEAR ---
  const [matrixRatesByYear, setMatrixRatesByYear] = useState<Record<string, Record<string, Record<string, number>>>>(() => {
    const cached = localStorage.getItem('audit_matrix_rates_by_year');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    
    // Seed default rates dynamically using existing universe attributes
    const initial25: Record<string, Record<string, number>> = {};
    const initial26: Record<string, Record<string, number>> = {};
    const initial27: Record<string, Record<string, number>> = {};

    universe.forEach(ent => {
      initial25[ent.id] = {
        'rf-financial': Math.floor(Math.random() * 3) + 2,
        'rf-operational': Math.floor(Math.random() * 3) + 2,
        'rf-compliance': Math.floor(Math.random() * 3) + 2,
        'rf-probability': Math.floor(Math.random() * 3) + 2,
        'rf-control': Math.floor(Math.random() * 3) + 2
      };

      initial26[ent.id] = {
        'rf-financial': Math.floor(Math.random() * 3) + 2,
        'rf-operational': Math.floor(Math.random() * 3) + 2,
        'rf-compliance': Math.floor(Math.random() * 3) + 2,
        'rf-probability': Math.floor(Math.random() * 3) + 2,
        'rf-control': Math.floor(Math.random() * 3) + 2
      };

      initial27[ent.id] = {
        'rf-financial': Math.floor(Math.random() * 3) + 2,
        'rf-operational': Math.floor(Math.random() * 3) + 2,
        'rf-compliance': Math.floor(Math.random() * 3) + 2,
        'rf-probability': Math.floor(Math.random() * 3) + 2,
        'rf-control': Math.floor(Math.random() * 3) + 2
      };
    });

    return {
      '2025': initial25,
      '2026': initial26,
      '2027': initial27
    };
  });

  // Expose virtual riskFactors and matrixRates mapped to active planning year
  const riskFactors = riskFactorsByYear[selectedYear] || [];
  const matrixRates = matrixRatesByYear[selectedYear] || {};

  const setRiskFactors = (updater: RiskFactor[] | ((prev: RiskFactor[]) => RiskFactor[])) => {
    setRiskFactorsByYear(prev => {
      const currentFactors = prev[selectedYear] || [];
      const nextFactors = typeof updater === 'function' ? updater(currentFactors) : updater;
      return {
        ...prev,
        [selectedYear]: nextFactors
      };
    });
  };

  const setMatrixRates = (updater: Record<string, Record<string, number>> | ((prev: Record<string, Record<string, number>>) => Record<string, Record<string, number>>)) => {
    setMatrixRatesByYear(prev => {
      const currentRates = prev[selectedYear] || {};
      const nextRates = typeof updater === 'function' ? updater(currentRates) : updater;
      return {
        ...prev,
        [selectedYear]: nextRates
      };
    });
  };

  // Cache changes statefully
  useEffect(() => {
    localStorage.setItem('audit_custom_risk_factors_by_year_v2', JSON.stringify(riskFactorsByYear));
  }, [riskFactorsByYear]);

  useEffect(() => {
    localStorage.setItem('audit_custom_risk_levels', JSON.stringify(riskLevels));
  }, [riskLevels]);

  useEffect(() => {
    localStorage.setItem('audit_matrix_rates_by_year', JSON.stringify(matrixRatesByYear));
  }, [matrixRatesByYear]);

  useEffect(() => {
    localStorage.setItem('audit_available_years', JSON.stringify(availableYears));
  }, [availableYears]);

  // General parameters states
  const [minScoreThreshold, setMinScoreThreshold] = useState<number>(1.0);
  const [distMode, setDistMode] = useState<'Prioritized' | 'Balanced'>('Prioritized');
  const [defaultAuditeeStatus, setDefaultAuditeeStatus] = useState<'Draft' | 'Submitted'>('Submitted');
  const [highRiskAuditors, setHighRiskAuditors] = useState<number>(3);
  const [medRiskAuditors, setMedRiskAuditors] = useState<number>(2);
  const [lowRiskAuditors, setLowRiskAuditors] = useState<number>(1);

  // Selector mappings for scheduling
  const [selectedEntityIds, setSelectedEntityIds] = useState<Record<string, boolean>>({});
  const [planTab, setPlanTab] = useState<'Draft' | 'Approved'>('Draft');

  // New Factor Form state
  const [newFactorName, setNewFactorName] = useState('');
  const [newFactorCategory, setNewFactorCategory] = useState<'Impact' | 'Likelihood'>('Impact');
  const [newFactorWeight, setNewFactorWeight] = useState<number>(15);
  const [newFactorDesc, setNewFactorDesc] = useState('');
  const [newFactorCategories, setNewFactorCategories] = useState<string[]>(['All']);

  const loadedUnits = ['Branch Audit Division', 'Financial & Ops Section', 'Compliance & Fraud Investigation Division'];
  const validAuditingUnits = loadedUnits.filter(u => u.toLowerCase() !== 'follow up team');

  // --- DYNAMIC TAXONOMY BUILDER STATE ---
  const [categoriesList, setCategoriesList] = useState<string[]>(() => {
    const cached = localStorage.getItem('audit_custom_categories_v2');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return parsed;
      } catch (e) {}
    }
    return validAuditingUnits; // fallback to validAuditingUnits to map old states if needed
  });

  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, string[]>>(() => {
    const cached = localStorage.getItem('audit_custom_subcategories_map_v2');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return parsed;
      } catch (e) {}
    }
    return {
      'IT Audit': ['Infrastructure', 'Applications', 'Security/Cybersecurity', 'System Administration', 'Networking'],
      'Branch Audit': ['Operations Audit', 'Credit & Loan', 'Cash Management', 'Customer Service'],
      'Corporate Audit': ['Finance & Accounting', 'Human Resources', 'Compliance & Legal', 'Strategic Operations']
    };
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('audit_custom_categories_v2', JSON.stringify(categoriesList));
  }, [categoriesList]);

  useEffect(() => {
    localStorage.setItem('audit_custom_subcategories_map_v2', JSON.stringify(subcategoriesMap));
  }, [subcategoriesMap]);

  // --- TAXONOMY MUTATION HANDLERS STATE ---
  const [newTaxonomyCategory, setNewTaxonomyCategory] = useState('');
  const [newTaxonomySubcategory, setNewTaxonomySubcategory] = useState<Record<string, string>>({});

  const handleAddTaxonomyCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaxonomyCategory.trim();
    if (!trimmed) return;
    if (categoriesList.includes(trimmed)) {
      return;
    }
    setCategoriesList([...categoriesList, trimmed]);
    setSubcategoriesMap(prev => ({
      ...prev,
      [trimmed]: []
    }));
    setNewTaxonomyCategory('');
    onLogAction('Taxonomy Category Created', `Added dynamic evaluation category: ${trimmed}`);
  };

  const handleAddTaxonomySubcategory = (cat: string) => {
    const text = newTaxonomySubcategory[cat]?.trim();
    if (!text) return;
    const currentSubs = subcategoriesMap[cat] || [];
    if (currentSubs.includes(text)) {
      return;
    }
    setSubcategoriesMap(prev => ({
      ...prev,
      [cat]: [...currentSubs, text]
    }));
    setNewTaxonomySubcategory(prev => ({
      ...prev,
      [cat]: ''
    }));
    onLogAction('Taxonomy Subcategory Created', `Added dynamic subcategory: ${text} under category ${cat}`);
  };

  const handleDeleteTaxonomyCategory = (cat: string) => {
    setCategoriesList(categoriesList.filter(c => c !== cat));
    setSubcategoriesMap(prev => {
      const updated = { ...prev };
      delete updated[cat];
      return updated;
    });
    setRiskFactors(prev => prev.filter(f => !f.applicableCategories?.includes(cat)));
    onLogAction('Taxonomy Category Deleted', `Removed category: ${cat}`);
  };

  const handleDeleteTaxonomySubcategory = (cat: string, sub: string) => {
    const currentSubs = subcategoriesMap[cat] || [];
    setSubcategoriesMap(prev => ({
      ...prev,
      [cat]: currentSubs.filter(s => s !== sub)
    }));
    onLogAction('Taxonomy Subcategory Deleted', `Removed subcategory: ${sub} from category ${cat}`);
  };

  // State for dynamic unit creator toggle & inputs
  const [showAddUnitForm, setShowAddUnitForm] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');
  const [editingUniverseEntity, setEditingUniverseEntity] = useState<AuditUniverseEntity | null>(null);
  const [newUnitCategory, setNewUnitCategory] = useState<string>('IT System');
  const [newUnitSubcategory, setNewUnitSubcategory] = useState<string>('');
  const [newUnitAuditingUnit, setNewUnitAuditingUnit] = useState<string>('IT Audit Division');
  const [newUnitOwner, setNewUnitOwner] = useState('');
  const [newUnitFinancial, setNewUnitFinancial] = useState<number>(3);
  const [newUnitOperational, setNewUnitOperational] = useState<number>(3);
  const [newUnitCompliance, setNewUnitCompliance] = useState<number>(3);
  const [newUnitLastAudited, setNewUnitLastAudited] = useState<string>(new Date().toISOString().split('T')[0]);

  // Dynamic score calculator utilizing dynamic weights and matrix fields
  const calculateEntityRisk = (entId: string): { 
    score: number; 
    level: string; 
    impactScore: number;
    likelihoodScore: number;
    hasNoFactors?: boolean;
  } => {
    const rates = matrixRates[entId] || {};
    const entity = universe.find(u => u.id === entId);
    const entityGroup = entity?.auditingUnit || 'Unassigned';

    const isFactorApplicable = (f: RiskFactor) => {
      if (!f.applicableCategories || f.applicableCategories.length === 0 || f.applicableCategories.includes('Unassigned')) {
        return false;
      }
      if (f.applicableCategories.includes('All')) {
        return true;
      }
      return f.applicableCategories.includes(entityGroup);
    };

    const activeFactorsForEntity = riskFactors.filter(isFactorApplicable);
    
    if (activeFactorsForEntity.length === 0) {
      return { 
        score: 0, 
        level: 'N/A', 
        impactScore: 0,
        likelihoodScore: 0,
        hasNoFactors: true
      };
    }
    
    // Impact Factors
    const impactFactors = activeFactorsForEntity.filter(f => f.category === 'Impact');
    const sumImpactWeight = impactFactors.reduce((sum, f) => sum + f.weight, 0);
    let weightedImpactGroupSum = 0;
    impactFactors.forEach(f => {
      const rate = rates[f.id] !== undefined ? rates[f.id] : 3;
      const factorNormWeight = sumImpactWeight > 0 ? (f.weight / sumImpactWeight) : (1 / impactFactors.length);
      weightedImpactGroupSum += rate * factorNormWeight;
    });

    // Likelihood Factors
    const likelihoodFactors = activeFactorsForEntity.filter(f => f.category === 'Likelihood');
    const sumLikelihoodWeight = likelihoodFactors.reduce((sum, f) => sum + f.weight, 0);
    let weightedLikelihoodGroupSum = 0;
    likelihoodFactors.forEach(f => {
      const rate = rates[f.id] !== undefined ? rates[f.id] : 3;
      const factorNormWeight = sumLikelihoodWeight > 0 ? (f.weight / sumLikelihoodWeight) : (1 / likelihoodFactors.length);
      weightedLikelihoodGroupSum += rate * factorNormWeight;
    });

    const finalImpact = impactFactors.length > 0 ? weightedImpactGroupSum : 0;
    const finalLikelihood = likelihoodFactors.length > 0 ? weightedLikelihoodGroupSum : 0;

    // Formula calculation: average of Impact and Likelihood if both exist
    let finalScore = 3.0;
    if (impactFactors.length > 0 && likelihoodFactors.length > 0) {
      finalScore = (finalImpact + finalLikelihood) / 2;
    } else if (impactFactors.length > 0) {
      finalScore = finalImpact;
    } else if (likelihoodFactors.length > 0) {
      finalScore = finalLikelihood;
    }

    // Limit score coordinates strictly between 1.0 and 5.0
    finalScore = parseFloat(Math.max(1.0, Math.min(5.0, finalScore)).toFixed(1));

    // Evaluate Risk Color/Category corresponding to dynamic Risk Levels defined
    let level = 'Low';
    const config = riskLevels.find(lvl => finalScore >= lvl.minScore && finalScore <= lvl.maxScore);
    if (config) {
      level = config.name.replace(' Risk', '');
    } else {
      if (finalScore >= 3.8) level = 'High';
      else if (finalScore >= 2.5) level = 'Medium';
    }

    return { 
      score: finalScore, 
      level, 
      impactScore: parseFloat(finalImpact.toFixed(1)),
      likelihoodScore: parseFloat(finalLikelihood.toFixed(1))
    };
  };

  // Compile full universe using existing scores
  const activeUniverse = universe.filter(ent => !ent.isDeleted);
  const evaluatedEntities = activeUniverse.map(ent => {
    const isAlreadyPlanned = annualPlan.some(p => p.entityId === ent.id);
    return {
      ...ent,
      calcScore: ent.riskScore,
      calcLevel: ent.riskLevel,
      calcImpact: 0, 
      calcLikelihood: 0,
      hasNoFactors: false, 
      isAlreadyPlanned
    };
  }).sort((a, b) => b.riskScore - a.riskScore);

  // Handle cell impact/likelihood rate alterations dynamically
  const handleUpdateRate = (entityId: string, factorId: string, value: number) => {
    setMatrixRates(prev => {
      const entitySection = prev[entityId] ? { ...prev[entityId] } : {};
      entitySection[factorId] = value;
      return {
        ...prev,
        [entityId]: entitySection
      };
    });
  };

  // Active cell rate increment/decrement triggers for seamless touch interactions
  const handleCycleRate = (entityId: string, factorId: string, direction: 'up' | 'down') => {
    const current = matrixRates[entityId]?.[factorId] ?? 3;
    let nextValue = current;
    if (direction === 'up' && current < 5) nextValue = current + 1;
    if (direction === 'down' && current > 1) nextValue = current - 1;
    if (nextValue !== current) {
      handleUpdateRate(entityId, factorId, nextValue);
    }
  };

  // Create / Clone to new assessment year
  const handleCreateNewYear = (newYear: string) => {
    if (!/^\d{4}$/.test(newYear)) {
      return;
    }
    if (availableYears.includes(newYear)) {
      return;
    }

    // Clone current year's factors
    const currentFactors = riskFactorsByYear[selectedYear] || [];
    const clonedFactors = currentFactors.map(f => ({ ...f }));

    // Start with empty rates for the newly initiated year (users must manually add/include units)
    const clonedRates: Record<string, Record<string, number>> = {};

    setRiskFactorsByYear(prev => ({
      ...prev,
      [newYear]: clonedFactors
    }));

    setMatrixRatesByYear(prev => ({
      ...prev,
      [newYear]: clonedRates
    }));

    setAvailableYears(prev => {
      const next = [...prev, newYear].sort();
      return next;
    });

    setSelectedYear(newYear);
    onLogAction('Assessment Cycle Addition', `Created and cloned assessment planning factors list to new year: ${newYear}`);
  };

  // Register New Dynamic Auditable Unit/Entity inside the universe on the fly
  const handleCreateDynamicUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim() || !newUnitOwner.trim()) {
      return;
    }

    const newId = `ent-custom-${Date.now()}`;
    const newEntity: AuditUniverseEntity = {
      id: newId,
      name: newUnitName,
      category: newUnitCategory,
      subcategory: newUnitSubcategory || undefined,
      auditingUnit: newUnitAuditingUnit || undefined,
      riskScore: 3.0,
      riskLevel: 'Medium'
    };

    // Add baseline matrix rates across all available years
    setMatrixRatesByYear(prev => {
      const updated = { ...prev };
      const defaultRates = riskFactors.reduce((acc, f) => { acc[f.id] = 3; return acc; }, {} as Record<string, number>);
      availableYears.forEach(yr => {
        if (!updated[yr]) updated[yr] = {};
        updated[yr][newId] = { ...defaultRates };
      });
      return updated;
    });

    onUpdateUniverse([...universe, newEntity]);
    onLogAction('Dynamic Unit Registration', `Created new dynamic auditable unit`);

    // Reset Form
    setNewUnitName('');
    setNewUnitOwner('');
    setNewUnitSubcategory('');
    setNewUnitAuditingUnit('IT Audit Division');
    setNewUnitFinancial(3);
    setNewUnitOperational(3);
    setNewUnitCompliance(3);
    setShowAddUnitForm(false);
  };

  // Define new dynamic risk factors
  const handleAddRiskFactor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactorName.trim()) return;

    const newId = `rf-custom-${Date.now()}`;
    const addedFactor: RiskFactor = {
      id: newId,
      name: newFactorName,
      category: newFactorCategory,
      weight: Number(newFactorWeight),
      description: newFactorDesc || 'User defined custom audit focus factor.',
      applicableCategories: [...newFactorCategories]
    };

    setRiskFactors(prev => [...prev, addedFactor]);

    onLogAction('Risk Setup Modification', `Registered custom Risk Factor: "${newFactorName}" weighted ${newFactorWeight}% for ${newFactorCategories.join(', ')}`);
    
    // Clear Form inputs
    setNewFactorName('');
    setNewFactorDesc('');
    setNewFactorCategories(['All']);
  };

  // Delete risk factor
  const handleDeleteRiskFactor = (factorId: string, name: string) => {
    setRiskFactors(prev => prev.filter(f => f.id !== factorId));
    onLogAction('Risk Setup Modification', `Deleted Risk Factor: "${name}"`);
  };

  // Edit Factor weights directly inline
  const handleUpdateFactorWeight = (factorId: string, weightValue: number) => {
    setRiskFactors(prev => prev.map(f => {
      if (f.id === factorId) {
        return { ...f, weight: Math.max(0, weightValue) };
      }
      return f;
    }));
  };

  // Adjust Risk levels thresholds bounds
  const handleUpdateRiskThreshold = (levelId: string, field: 'minScore' | 'maxScore', val: number) => {
    setRiskLevels(prev => prev.map(lvl => {
      if (lvl.id === levelId) {
        const parsed = parseFloat(Math.max(1.0, Math.min(5.0, val)).toFixed(1));
        return { ...lvl, [field]: parsed };
      }
      return lvl;
    }));
  };

  // Dynamic selection checker for compiling
  const isChecked = (entId: string, isPlanned: boolean, score: number) => {
    if (selectedEntityIds[entId] !== undefined) {
      return selectedEntityIds[entId];
    }
    return !isPlanned && score >= minScoreThreshold;
  };

  // Toggle checklist selection
  const handleToggleEntityCheck = (entId: string, currentVal: boolean) => {
    setSelectedEntityIds(prev => ({
      ...prev,
      [entId]: !currentVal
    }));
  };

  // Group selectors
  const handleSelectCalculatedGroup = (type: 'all' | 'none' | 'high' | 'over_threshold') => {
    const newLocks: Record<string, boolean> = {};
    evaluatedEntities.forEach(ent => {
      if (type === 'all') {
        newLocks[ent.id] = true;
      } else if (type === 'none') {
        newLocks[ent.id] = false;
      } else if (type === 'high') {
        newLocks[ent.id] = ent.calcLevel === 'High';
      } else if (type === 'over_threshold') {
        newLocks[ent.id] = ent.calcScore >= minScoreThreshold;
      }
    });
    setSelectedEntityIds(newLocks);
  };

  // Reset customized weights & values
  const handleResetParameters = () => {
    setRiskFactors([]);
    setRiskLevels([
      { id: 'rl-low', name: 'Low Risk', minScore: 1.0, maxScore: 2.3, bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200', textColor: 'text-emerald-700' },
      { id: 'rl-medium', name: 'Medium Risk', minScore: 2.3, maxScore: 3.4, bgColor: 'bg-amber-50 text-amber-900 border-amber-200', textColor: 'text-amber-700' },
      { id: 'rl-high', name: 'High Risk', minScore: 3.4, maxScore: 5.0, bgColor: 'bg-rose-50 text-rose-900 border-rose-200', textColor: 'text-rose-700' }
    ]);
    setMinScoreThreshold(3.0);
    onLogAction('Risk Parameters Reset', 'Restored corporate default risk assessment weighting index ratios & level configs.');
  };

  // Persist scores onto the Live Audit Universe registry
  const handleApplyToUniverseRegistry = () => {
    const updatedUniverse = universe.map(ent => {
      const evaluation = calculateEntityRisk(ent.id);
      return {
        ...ent,
        riskScore: evaluation.score,
        riskLevel: evaluation.level as 'High' | 'Medium' | 'Low'
      };
    });
    onUpdateUniverse(updatedUniverse);
    onLogAction('Risk Score Re-evaluation', 'Persisted custom multi-factor recalculated scores onto live Audit Universe.');
  };


  // Sign-off helper
  const handlePlanStatusUpdate = (id: string, status: 'Approved' | 'Draft', authorName: string) => {
    // Determine the entity ID from either the plain item ID or entityId
    let entityId = '';
    const existingPlanItem = annualPlan.find(item => item.id === id);
    if (existingPlanItem) {
      entityId = existingPlanItem.entityId;
    } else {
      const entMatched = evaluatedEntities.find(e => `p-${e.id}` === id || e.id === id);
      if (entMatched) {
        entityId = entMatched.id;
      }
    }

    const ent = evaluatedEntities.find(e => e.id === entityId);
    if (!ent) return;

    let updated: AnnualPlanItem[];

    if (status === 'Approved') {
      // Freezing! We create or update the approved item in annualPlan.
      let targetQ: 'Q1' | 'Q2' | 'Q3' | 'Q4' = 'Q4';
      if (ent.calcLevel === 'High') targetQ = 'Q1';
      else if (ent.calcLevel === 'Medium') targetQ = 'Q2';
      
      let resources = 2;
      if (ent.calcLevel === 'High') resources = 3;
      else if (ent.calcLevel === 'Medium') resources = 2;
      else resources = 1;

      // Check if we have manually custom timeline parameters in an existing draft
      const draftItem = annualPlan.find(p => p.entityId === ent.id && p.status !== 'Approved' && p.auditYear === selectedYear);

      const approvedItemDetails: AnnualPlanItem = {
        id: `p-${ent.id}-approved`,
        auditYear: selectedYear,
        entityId: ent.id,
        entityName: ent.name,
        riskLevel: ent.calcLevel as 'High' | 'Medium' | 'Low',
        riskScore: ent.calcScore,
        targetQuarter: draftItem?.targetQuarter || targetQ,
        targetMonth: draftItem?.targetMonth || ((targetQ as string) === 'Q1' ? 'January' : (targetQ as string) === 'Q2' ? 'April' : (targetQ as string) === 'Q3' ? 'July' : 'October'),
        assignedResources: draftItem?.assignedResources !== undefined ? draftItem.assignedResources : resources,
        status: 'Approved',
        approvedBy: authorName,
        approvalDate: new Date().toISOString().split('T')[0],
        approvedRates: { ...(matrixRates[ent.id] || {}) } as any
      } as any;

      // Filter out any prior approved item for this entity & year
      const basePlan = annualPlan.filter(p => p.id !== `p-${ent.id}-approved` && (p.entityId !== ent.id || p.status !== 'Approved' || p.auditYear !== selectedYear));
      updated = [...basePlan, approvedItemDetails];
    } else {
      // Rejecting or resetting to draft!
      // Remove any approved item to revert it
      const basePlan = annualPlan.filter(p => p.id !== `p-${ent.id}-approved` && (p.entityId !== ent.id || p.status !== 'Approved' || p.auditYear !== selectedYear));
      
      const existingDraftIndex = basePlan.findIndex(p => p.entityId === ent.id && p.status !== 'Approved' && p.auditYear === selectedYear);
      let targetQ: 'Q1' | 'Q2' | 'Q3' | 'Q4' = 'Q4';
      if (ent.calcLevel === 'High') targetQ = 'Q1';
      else if (ent.calcLevel === 'Medium') targetQ = 'Q2';
      
      let resources = 2;
      if (ent.calcLevel === 'High') resources = 3;
      else if (ent.calcLevel === 'Medium') resources = 2;
      else resources = 1;

      if (existingDraftIndex >= 0) {
        basePlan[existingDraftIndex] = {
          ...basePlan[existingDraftIndex],
          status: 'Draft'
        };
      } else {
        basePlan.push({
          id: `p-${ent.id}-draft`,
          auditYear: selectedYear,
          entityId: ent.id,
          entityName: ent.name,
          riskLevel: ent.calcLevel as 'High' | 'Medium' | 'Low',
          riskScore: ent.calcScore,
          targetQuarter: targetQ,
          targetMonth: (targetQ as string) === 'Q1' ? 'January' : (targetQ as string) === 'Q2' ? 'April' : (targetQ as string) === 'Q3' ? 'July' : 'October',
          assignedResources: resources,
          status: 'Draft'
        });
      }
      updated = basePlan;
    }

    onUpdateAnnualPlan(updated);
    onLogAction('Plan Endorsement Action', `Plan item for entity "${ent.name}" status updated to: ${status} by ${authorName}`);
  };

  // Color coordinate cell rate values (1 to 5 heat maps)
  const getHeatmapColor = (rate: number) => {
    switch (rate) {
      case 1: return 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100';
      case 2: return 'bg-emerald-100/70 text-emerald-900 border-emerald-200 hover:bg-emerald-200/50';
      case 3: return 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100';
      case 4: return 'bg-orange-50 text-orange-900 border-orange-200 hover:bg-orange-100';
      case 5: return 'bg-red-50 text-red-900 border-red-200 hover:bg-red-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-205';
    }
  };

  // Filtered lists matching user search on the Matrix Board
  const filteredEvaluations = evaluatedEntities.filter(ent => {
    const matchesSearch = ent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (ent.auditingUnit || 'Unassigned').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || (ent.auditingUnit || 'Unassigned') === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const allPresentDivisions = Array.from(new Set([...validAuditingUnits, ...evaluatedEntities.map(e => e.auditingUnit || 'Unassigned')]));
  const visibleDivisions = categoryFilter === 'All' ? allPresentDivisions : allPresentDivisions.filter(c => c === categoryFilter);

  return (
    <div className="space-y-6" id="risk_assessment_main">
      
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-200 pb-5" id="assessment_header">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-2 uppercase">
            <Sliders className="w-6 h-6 text-indigo-600" />
            {targetModule === 'AnnualPlan' ? 'Annual Work Plan' : (targetModule === 'RiskAssessment' ? 'Audit Risk Assessment' : 'Audit Risk Assessment & Annual Work Plan')}
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Define multi-criteria risk factors & levels, rate vulnerabilities on an interactive matrix grid, and dynamically schedule your annual plan.
          </p>
        </div>
        
        {/* Explicit Save Interactivity (does not alter actual saving logic) */}
        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          <button
            onClick={handleManualSave}
            disabled={isSaving}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
            ) : showSavedMsg ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <Save className="w-4 h-4 text-slate-500" />
            )}
            {isSaving ? 'Saving...' : showSavedMsg ? 'Saved!' : 'Save Progress'}
          </button>
          
          {/* Persistence Sync button on global navigation bar */}
          <button
            onClick={handleApplyToUniverseRegistry}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Save matrix calculated scores into the primary Audit Universe catalog"
          >
            <Award className="w-3.5 h-3.5 text-white" />
            Apply Matrix Ratings to Universe
          </button>
        </div>
      </div>

      {/* Main Layout containing Tabs and Content */}
      <div className="flex flex-col gap-6 items-stretch">
        
        {/* Top Tab Navigation */}
        {targetModule !== 'AnnualPlan' && (
          <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200" id="top_tab_navigation">
            <button
              onClick={() => setActiveSubTab('Setup')}
              className={`px-5 py-2.5 font-bold text-xs rounded-t-xl transition-all flex items-center justify-center gap-2 cursor-pointer border-b-2 ${
                activeSubTab === 'Setup' 
                  ? 'bg-indigo-50/50 text-indigo-700 border-indigo-600' 
                  : 'bg-transparent text-slate-500 hover:bg-slate-50 border-transparent hover:border-slate-300'
              }`}
            >
              <Settings className={`w-4 h-4 ${activeSubTab === 'Setup' ? 'text-indigo-600' : 'text-slate-400'}`} /> 
              <span className="whitespace-nowrap">Risk Assessment Setup</span>
            </button>

            <button
              onClick={() => setActiveSubTab('Matrix')}
              className={`px-5 py-2.5 font-bold text-xs rounded-t-xl transition-all flex items-center justify-center gap-2 cursor-pointer border-b-2 ${
                activeSubTab === 'Matrix' 
                  ? 'bg-indigo-50/50 text-indigo-700 border-indigo-600' 
                  : 'bg-transparent text-slate-500 hover:bg-slate-50 border-transparent hover:border-slate-300'
              }`}
            >
              <Grid className={`w-4 h-4 ${activeSubTab === 'Matrix' ? 'text-indigo-600' : 'text-slate-400'}`} /> 
              <span className="whitespace-nowrap">Risk Assessment Matrix</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] ${activeSubTab === 'Matrix' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>{evaluatedEntities.length}</span>
            </button>

            {targetModule !== 'RiskAssessment' && (
              <button
                onClick={() => setActiveSubTab('Plan')}
                className={`px-5 py-2.5 font-bold text-xs rounded-t-xl transition-all flex items-center justify-center gap-2 cursor-pointer border-b-2 ${
                  activeSubTab === 'Plan' 
                    ? 'bg-indigo-50/50 text-indigo-700 border-indigo-600' 
                    : 'bg-transparent text-slate-500 hover:bg-slate-50 border-transparent hover:border-slate-300'
                }`}
              >
                <FileText className={`w-4 h-4 ${activeSubTab === 'Plan' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span className="whitespace-nowrap">Draft Plan</span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] flex items-center gap-1 ${activeSubTab === 'Plan' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                  {evaluatedEntities.length}
                </span>
              </button>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="w-full space-y-6">

      {/* Unified Hero & Control Hub */}
      <div className="bg-slate-900 text-white rounded-xl p-4 md:p-5 border border-slate-800 shadow-sm relative overflow-hidden flex flex-col gap-4">
        <div className="absolute right-0 top-0 opacity-5 transform translate-x-12 -translate-y-6 pointer-events-none">
          <Calculator className="w-48 h-48 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-xl">
            {activeSubTab === 'Matrix' ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-indigo-800/80 text-indigo-300 border border-indigo-700/50 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Multi-Criteria Decision Matrix
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
                  Interactive Audit Universe & Factors Matrix
                </h2>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl">
                  Map all auditable areas against risk factors. Rate metrics directly in the grid. Changes instantly recalculate weighted averages and update risk categories.
                </p>
              </>
            ) : activeSubTab === 'Setup' ? (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-emerald-800/80 text-emerald-300 border border-emerald-700/50 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Configuration Engine
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
                  Risk Assessment Setup
                </h2>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl">
                  Configure risk factors, weightings, and tolerance levels for this fiscal cycle to guide risk rating calculations.
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-amber-800/80 text-amber-300 border border-amber-700/50 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Workflow & Scheduling
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
                  Annual Work Plan
                </h2>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl">
                  View and manage the draft audit plan based on the calculated priorities and threshold bounds.
                </p>
              </>
            )}
          </div>
          
          <div className="flex flex-col gap-2 w-full lg:w-auto shrink-0 z-10 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
            <div className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">Fiscal Cycle</span>
              </div>
              <span className="text-[9px] text-slate-500 font-medium">Independent Risk Weights</span>
            </div>
            {/* Year Selectors */}
            <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-700/80 gap-1 overflow-x-auto shadow-inner">
              {availableYears.map(yr => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer whitespace-nowrap outline-none ${
                    selectedYear === yr 
                      ? 'bg-indigo-600 text-white shadow-sm border border-indigo-500' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700 border border-transparent'
                  }`}
                >
                  FY-{yr}-{String(parseInt(yr) + 1).slice(2)}
                </button>
              ))}
            </div>
            
            {/* Inline Clone form & Add unit form */}
            <div className="flex flex-col sm:flex-row items-center gap-2 mt-1">
              <div className="flex items-center flex-1 bg-slate-900/80 border border-slate-700/80 rounded-lg text-xs shadow-inner h-8">
                <select
                  id="new_year_select_field"
                  className="bg-transparent font-semibold focus:outline-none text-slate-300 cursor-pointer w-full pl-2 pr-1 border-r border-slate-700 text-[11px]"
                  defaultValue=""
                >
                  <option value="" disabled className="text-slate-900">Select...</option>
                  {[2028, 2029, 2030, 2031, 2032, 2033].map(y => (
                    <option key={y} value={y} disabled={availableYears.includes(y.toString())} className="text-slate-900 font-medium">
                      {availableYears.includes(y.toString()) ? `FY-${y} (Exists)` : `FY-${y}`}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('new_year_select_field') as HTMLSelectElement;
                    const val = el?.value;
                    if (val) {
                      handleCreateNewYear(val);
                      el.value = '';
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-0 text-[10px] font-bold uppercase rounded-r-lg shadow-sm cursor-pointer transition-colors whitespace-nowrap flex items-center h-full border-l border-indigo-500"
                  title="Initiate Assessment"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Dynamic Unit register button visible only in Matrix */}
              {activeSubTab === 'Matrix' && (
                <div className="flex gap-2 w-full sm:w-auto h-8">
                  <button
                    type="button"
                    onClick={() => setShowAddUnitForm(prev => !prev)}
                    className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-bold text-[11px] px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors flex-1 whitespace-nowrap"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                    {showAddUnitForm ? 'Collapse' : 'Add Unit'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('Plan')}
                    className="bg-indigo-900/60 border border-indigo-500/50 text-indigo-200 hover:bg-indigo-800 hover:text-white flex items-center justify-center gap-1.5 px-3 font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex-1 whitespace-nowrap shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Draft Plan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: INTERACTIVE RISK FACTORS MATRIX BOARD */}
      {activeSubTab === 'Matrix' && (
        <div className="space-y-6 animate-fade-in" id="risk_matrix_view_tab">
          
          {/* Dynamic Auditable Unit inline sliding card form */}
          {showAddUnitForm && (
            <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-md space-y-4 animate-fade-in">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Plus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900 uppercase">Register Dynamic Auditable Unit / Entity</h3>
              </div>

              <form onSubmit={handleCreateDynamicUnit} className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-slate-700">Auditable Unit Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ethiopia Digital Banking Division"
                    value={newUnitName}
                    onChange={e => setNewUnitName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:bg-white focus:border-indigo-600"
                  />
                </div>

                 <div className="space-y-1">
                  <label className="font-bold text-slate-700">Audit Universe Category</label>
                  <select
                    value={newUnitCategory}
                    onChange={e => {
                      const cat = e.target.value;
                      setNewUnitCategory(cat);
                      // Auto select first subcategory of that category if available, else empty
                      const defaultSub = subcategoriesMap[cat]?.length ? subcategoriesMap[cat][0] : '';
                      setNewUnitSubcategory(defaultSub);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:bg-white cursor-pointer"
                  >
                    {(() => {
                      let ucats = ['Corporate Audit', 'Branch Audit', 'IT Audit', 'Head Office Audit', 'IFB Audit'];
                      const c = localStorage.getItem('audit_custom_categories');
                      if (c) { try { ucats = JSON.parse(c); } catch(e){} }
                      return ucats.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ));
                    })()}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Audit Sub-category</label>
                  <select
                    value={subcategoriesMap[newUnitCategory]?.includes(newUnitSubcategory) ? newUnitSubcategory : (newUnitSubcategory ? 'custom_input_text' : '')}
                    onChange={e => {
                      const v = e.target.value;
                      if (v === 'custom_input_text') {
                        setNewUnitSubcategory('');
                      } else {
                        setNewUnitSubcategory(v);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="">-- No Subcategory --</option>
                    {(subcategoriesMap[newUnitCategory] || []).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                    <option value="custom_input_text">-- Custom / Other Sub-category --</option>
                  </select>
                </div>

                {(!subcategoriesMap[newUnitCategory]?.includes(newUnitSubcategory) || newUnitSubcategory === '') && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Custom Sub-category Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Cybersecurity, Networking, Operations..."
                      value={newUnitSubcategory}
                      onChange={e => setNewUnitSubcategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-indigo-200 rounded-lg font-semibold focus:outline-none focus:bg-white"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Assigned Auditing Division (Unit)</label>
                  <select
                    value={newUnitAuditingUnit}
                    onChange={e => setNewUnitAuditingUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:outline-none focus:bg-white cursor-pointer"
                  >
                    {validAuditingUnits.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end justify-end col-span-1 md:col-span-2 mt-4">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl cursor-pointer transition-colors shadow-xs hover:shadow-sm"
                  >
                    Create Auditable Unit +
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="flex flex-col gap-6" id="matrix_filter_and_config">
            {/* Top Filter & Threshold configuration deck */}
            <div className="bg-white p-4 rounded-xl border border-slate-205 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
              
              <div className="flex flex-col md:flex-row gap-4 items-end flex-grow">
                {/* Category Filter */}
                <div className="space-y-1 min-w-[200px]">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Auditing Division Scope</label>
                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white cursor-pointer"
                  >
                    <option value="All">All Divisions</option>
                    {allPresentDivisions.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Risk Level Boundaries Configuration */}
                <div className="flex-grow bg-slate-50/80 p-4 text-xs rounded-xl border border-slate-205 flex flex-col lg:flex-row gap-5 items-stretch min-w-[320px] lg:min-w-[650px] shadow-sm">
                  {(() => {
                    const lowLevel = riskLevels.find(l => l.id === 'rl-low') || { minScore: 1.0, maxScore: 2.3 };
                    const medLevel = riskLevels.find(l => l.id === 'rl-medium') || { minScore: 2.3, maxScore: 3.4 };
                    const highLevel = riskLevels.find(l => l.id === 'rl-high') || { minScore: 3.4, maxScore: 5.0 };

                    const lowToMed = lowLevel.maxScore;
                    const medToHigh = medLevel.maxScore;

                    const updateLevels = (newLowToMed: number, newMedToHigh: number) => {
                      setRiskLevels([
                        { id: 'rl-low', name: 'Low Risk', minScore: 1.0, maxScore: newLowToMed, bgColor: 'bg-emerald-50 text-emerald-800 border-emerald-200', textColor: 'text-emerald-700' },
                        { id: 'rl-medium', name: 'Medium Risk', minScore: newLowToMed, maxScore: newMedToHigh, bgColor: 'bg-amber-50 text-amber-900 border-amber-200', textColor: 'text-amber-700' },
                        { id: 'rl-high', name: 'High Risk', minScore: newMedToHigh, maxScore: 5.0, bgColor: 'bg-rose-50 text-rose-900 border-rose-200', textColor: 'text-rose-700' }
                      ]);
                    };

                    const lowPercent = ((lowToMed - 1.0) / 4.0) * 100;
                    const medPercent = ((medToHigh - lowToMed) / 4.0) * 100;
                    const highPercent = Math.max(0, 100 - lowPercent - medPercent);

                    return (
                      <>
                        {/* LEFT COLUMN: Dynamic Boundary Adjustments */}
                        <div className="flex flex-col justify-between flex-grow lg:w-3/5 lg:border-r lg:border-slate-200 lg:pr-5 pr-0 border-r-0 lg:pb-0 pb-4 border-b lg:border-b-0 border-slate-200">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              <span className="text-slate-600">Risk Boundaries Slider:</span>
                              <span className="text-indigo-650 font-sans font-bold text-[9px] bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">All Entities Assessed</span>
                            </div>

                            {/* Dynamic Integrated Background Track representing the risk levels */}
                            <div className="relative mt-2.5 mb-1.5 h-3.5 rounded-full flex overflow-hidden opacity-90 border border-slate-250 shadow-inner">
                              <div style={{ width: `${lowPercent}%` }} className="bg-emerald-400 h-full flex items-center justify-center text-[8px] text-emerald-950 font-extrabold tracking-wide">Low</div>
                              <div style={{ width: `${medPercent}%` }} className="bg-amber-400 h-full flex items-center justify-center text-[8px] text-amber-950 font-extrabold tracking-wide">Medium</div>
                              <div style={{ width: `${highPercent}%` }} className="bg-rose-400 h-full flex items-center justify-center text-[8px] text-rose-950 font-extrabold tracking-wide">High</div>
                            </div>
                            
                            <div className="flex justify-between text-[8px] text-slate-400 font-bold font-mono px-1">
                              <span>1.0</span>
                              <span className="text-center font-medium">Low (1.0 - {lowToMed.toFixed(1)})</span>
                              <span>{lowToMed.toFixed(1)}</span>
                              <span className="text-center font-medium">Med ({lowToMed.toFixed(1)} - {medToHigh.toFixed(1)})</span>
                              <span>{medToHigh.toFixed(1)}</span>
                              <span className="text-center font-medium">High ({medToHigh.toFixed(1)} - 5.0)</span>
                              <span>5.0</span>
                            </div>
                          </div>

                          {/* Dynamic Threshold Sliders */}
                          <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-2.5 mt-2">
                            {/* Low to Med Boundary Slider */}
                            <div className="space-y-0.5">
                              <div className="flex justify-between text-[9px] font-bold text-slate-600">
                                <span>Low ➔ Medium Boundary</span>
                                <span className="text-emerald-700 font-mono font-extrabold text-[10px] bg-emerald-50 px-1 rounded border border-emerald-100">{lowToMed.toFixed(1)}</span>
                              </div>
                              <input
                                type="range"
                                min="1.1"
                                max="4.8"
                                step="0.1"
                                value={lowToMed}
                                onChange={e => {
                                  let val = parseFloat(e.target.value);
                                  if (val >= medToHigh) {
                                    val = medToHigh - 0.1;
                                  }
                                  updateLevels(val, medToHigh);
                                }}
                                className="w-full h-1 accent-emerald-600 cursor-pointer mt-0.5"
                              />
                            </div>

                            {/* Med to High Boundary Slider */}
                            <div className="space-y-0.5">
                              <div className="flex justify-between text-[9px] font-bold text-slate-600">
                                <span>Medium ➔ High Boundary</span>
                                <span className="text-rose-700 font-mono font-extrabold text-[10px] bg-rose-50 px-1 rounded border border-rose-105">{medToHigh.toFixed(1)}</span>
                              </div>
                              <input
                                type="range"
                                min="1.2"
                                max="4.9"
                                step="0.1"
                                value={medToHigh}
                                onChange={e => {
                                  let val = parseFloat(e.target.value);
                                  if (val <= lowToMed) {
                                    val = lowToMed + 0.1;
                                  }
                                  updateLevels(lowToMed, val);
                                }}
                                className="w-full h-1 accent-rose-500 cursor-pointer mt-0.5"
                              />
                            </div>
                          </div>
                        </div>

                        {/* RIGHT COLUMN: Professional Score level statistics breakdown */}
                        <div className="flex flex-col justify-between lg:w-2/5 pl-0 lg:pl-1 mt-1 lg:mt-0">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">
                              Recalculated Risk Portfolios
                            </span>
                            
                            <div className="space-y-1.5">
                              {/* LOW PORTFOLIO row */}
                              <div className="flex items-center justify-between p-2 bg-emerald-50/60 border border-emerald-100 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
                                  <span className="font-bold text-emerald-900 text-[11px]">Low Risk</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                  <span className="text-slate-500 font-mono text-[9px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-150">1.0 - {lowToMed.toFixed(1)}</span>
                                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-extrabold font-mono text-[10px] border border-emerald-200 min-w-[70px] text-center">
                                    {evaluatedEntities.filter(ent => !ent.hasNoFactors && ent.calcLevel === 'Low').length} units
                                  </span>
                                </div>
                              </div>

                              {/* MEDIUM PORTFOLIO row */}
                              <div className="flex items-center justify-between p-2 bg-amber-50/60 border border-amber-100 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
                                  <span className="font-bold text-amber-900 text-[11px]">Medium Risk</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                  <span className="text-slate-500 font-mono text-[9px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-150">{lowToMed.toFixed(1)} - {medToHigh.toFixed(1)}</span>
                                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-extrabold font-mono text-[10px] border border-amber-200 min-w-[70px] text-center">
                                    {evaluatedEntities.filter(ent => !ent.hasNoFactors && ent.calcLevel === 'Medium').length} units
                                  </span>
                                </div>
                              </div>

                              {/* HIGH PORTFOLIO row */}
                              <div className="flex items-center justify-between p-2 bg-rose-50/60 border border-rose-100 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block"></span>
                                  <span className="font-bold text-rose-900 text-[11px]">High Risk</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                  <span className="text-slate-500 font-mono text-[9px] font-bold bg-white px-1.5 py-0.5 rounded border border-slate-150">{medToHigh.toFixed(1)} - 5.0</span>
                                  <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md font-extrabold font-mono text-[10px] border border-rose-205 min-w-[70px] text-center">
                                    {evaluatedEntities.filter(ent => !ent.hasNoFactors && ent.calcLevel === 'High').length} units
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-2 text-[9px] text-slate-400 font-medium flex justify-between items-center border-t border-slate-200/50 pt-2">
                            <span>Total under Review: <strong className="text-slate-700 font-bold font-mono">{evaluatedEntities.length} units</strong></span>
                            <span>All Risk Division Segments are Live</span>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>

              </div>

            </div>

            {/* Bottom Matrix Workspace Grid Table */}
            <div className="w-full bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden" id="matrix_table_workspace">
              
              <div className="p-4 border-b border-indigo-50 bg-indigo-50/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-905 flex items-center gap-1 uppercase">
                    <Grid className="w-4 h-4 text-indigo-600" />
                    Interactive Risk Assessment Matrix Board
                  </h3>
                  <p className="text-[10px] text-slate-504 font-medium mt-0.5">
                    Spreadsheet view mappings. Use this board to assess and rate entities.
                  </p>
                </div>
                
                <div className="flex items-center gap-1.5">
                </div>
              </div>

              <div className="space-y-8">
                {filteredEvaluations.length === 0 ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                    <table className="w-full text-left border-collapse">
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                        <tr>
                          <td className="p-8 text-center text-slate-400 font-bold bg-slate-50">
                            <div className="flex flex-col items-center justify-center space-y-3">
                              <span className="italic">No items have been included in the current year matrix yet.</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setMatrixRatesByYear(prev => {
                                    const updatedYear = { ...(prev[selectedYear] || {}) };
                                    const defaultRates = riskFactors.reduce((acc, f) => { acc[f.id] = 3; return acc; }, {} as Record<string, number>);
                                    universe.filter(u => !u.isDeleted).forEach(ent => {
                                      updatedYear[ent.id] = { ...defaultRates };
                                    });
                                    return { ...prev, [selectedYear]: updatedYear };
                                  });
                                }}
                                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-4 py-2 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer"
                              >
                                Include All Entities
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  visibleDivisions.map(unitGroup => {
                    const groupEntities = filteredEvaluations
                      .filter(ent => (ent.auditingUnit || 'Unassigned') === unitGroup)
                      .sort((a, b) => a.name.localeCompare(b.name));
                    
                    const catRiskFactors = riskFactors.filter(factor => {
                      return !factor.applicableCategories || factor.applicableCategories.length === 0 || factor.applicableCategories.includes('All') || factor.applicableCategories.includes(unitGroup);
                    });
                    
                    const impactFactors = catRiskFactors.filter(f => f.category === 'Impact');
                    const likelihoodFactors = catRiskFactors.filter(f => f.category === 'Likelihood');
                    const sumImpactWeight = impactFactors.reduce((sum, f) => sum + f.weight, 0);
                    const sumLikelihoodWeight = likelihoodFactors.reduce((sum, f) => sum + f.weight, 0);

                    return (
                      <div key={unitGroup} className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                          <h4 className="font-extrabold text-indigo-900 text-[11px] uppercase tracking-wider">{unitGroup}</h4>
                          <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 border border-slate-200 rounded text-center">
                            {groupEntities.length} Evaluated {groupEntities.length === 1 ? 'Entity' : 'Entities'}
                          </span>
                        </div>
                        <table className="w-full text-left border-collapse" id={`dynamic_rm_table_${unitGroup.replace(/\s+/g, '_')}`}>
                          <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              <th className="p-3 min-w-36">Auditable Entity Name</th>
                              {catRiskFactors.map(factor => {
                                const isUnassigned = !factor.applicableCategories || factor.applicableCategories.length === 0 || factor.applicableCategories.includes('Unassigned');
                                const isGlobal = factor.applicableCategories?.includes('All');
                                const groupLabel = isUnassigned ? 'Unassigned' : (isGlobal ? 'Global' : factor.applicableCategories[0]);
                                return (
                                  <th key={factor.id} className="p-3 text-center min-w-[120px] border-l border-slate-100" title={`${groupLabel} - ${factor.description}`}>
                                    <span className="block text-[8px] font-semibold uppercase text-indigo-650 tracking-wider">
                                      {factor.category} ({factor.weight}%)
                                    </span>
                                    <span className="block text-[10px] text-slate-700 truncate font-bold">{factor.name}</span>
                                  </th>
                                );
                              })}
                              <th className="p-3 text-center border-l-2 border-slate-200 bg-indigo-50/20 min-w-20 text-indigo-950 font-semibold">Agg. Impact (%)</th>
                              <th className="p-3 text-center border-l border-slate-100 bg-indigo-50/20 min-w-20 text-indigo-950 font-semibold">Avg. Score (/5)</th>
                              <th className="p-3 text-center border-l border-slate-100 min-w-20">Risk Tier</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                            {groupEntities.length === 0 ? (
                              <tr>
                                <td colSpan={catRiskFactors.length + 5} className="p-8 text-center text-slate-400 font-bold bg-slate-50 italic">
                                  No entities evaluated yet. Include from Universe.
                                </td>
                              </tr>
                            ) : (
                              groupEntities.map(ent => {
                                const scoreData = calculateEntityRisk(ent.id);
                                const isTargetChecked = isChecked(ent.id, ent.isAlreadyPlanned, scoreData.score);
                                const targetColor = riskLevels.find(l => scoreData.level === l.name.replace(' Risk', '')) || { textColor: 'text-indigo-700', bgColor: 'bg-indigo-50' };

                                return (
                                <tr 
                                  key={ent.id} 
                                  className={`hover:bg-indigo-50/20 transition-all ${ent.isAlreadyPlanned ? 'opacity-80 bg-slate-50/40' : ''}`}
                                  id={`matrix_ent_tr_${ent.id}`}
                                >
                                  <td className="p-3">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex flex-col gap-0.5">
                                        <span className="font-bold text-slate-900 text-[12px]">{ent.name}</span>
                                        <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-slate-400 font-semibold uppercase">
                                          {ent.subcategory && (
                                            <span className="text-emerald-700 font-bold">{ent.subcategory}</span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => setEditingUniverseEntity(ent)}
                                          className="text-slate-400 hover:text-indigo-650 hover:bg-indigo-50 p-1.5 rounded flex items-center justify-center transition-colors cursor-pointer"
                                          title={`Edit ${ent.name}`}
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Render Factor Inputs */}
                                  {catRiskFactors.map(factor => {
                                    const cellRate = matrixRates[ent.id]?.[factor.id] ?? 3;
                                    
                                    let factorNormWeight = 0;
                                    if (factor.category === 'Impact') {
                                      factorNormWeight = sumImpactWeight > 0 ? (factor.weight / sumImpactWeight) : (1 / impactFactors.length);
                                    } else {
                                      factorNormWeight = sumLikelihoodWeight > 0 ? (factor.weight / sumLikelihoodWeight) : (1 / likelihoodFactors.length);
                                    }
                                    const weightedScore = (cellRate * factorNormWeight).toFixed(2);

                                    return (
                                      <td key={factor.id} className="p-3 text-center border-l border-slate-100">
                                        <div className="flex flex-col items-center justify-center gap-1.5">
                                          <div className="flex items-center justify-center gap-1">
                                            <button
                                              type="button"
                                              disabled={cellRate <= 1}
                                              onClick={() => handleCycleRate(ent.id, factor.id, 'down')}
                                              className="w-4 h-4 rounded-full border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-[9px] text-slate-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none"
                                            >
                                              -
                                            </button>
                                            <select
                                              value={cellRate}
                                              onChange={e => handleUpdateRate(ent.id, factor.id, parseInt(e.target.value))}
                                              className={`px-1 py-0.5 text-[10px] font-semibold rounded-md border text-center font-mono cursor-pointer transition-all focus:outline-none focus:ring-1 focus:ring-indigo-600 ${getHeatmapColor(cellRate)}`}
                                            >
                                              <option value={1} className="bg-white text-slate-900 py-1">1</option>
                                              <option value={2} className="bg-white text-slate-900 py-1">2</option>
                                              <option value={3} className="bg-white text-slate-900 py-1">3</option>
                                              <option value={4} className="bg-white text-slate-900 py-1">4</option>
                                              <option value={5} className="bg-white text-slate-900 py-1">5</option>
                                            </select>
                                            <button
                                              type="button"
                                              disabled={cellRate >= 5}
                                              onClick={() => handleCycleRate(ent.id, factor.id, 'up')}
                                              className="w-4 h-4 rounded-full border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center font-bold text-[9px] text-slate-500 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed select-none"
                                            >
                                              +
                                            </button>
                                          </div>
                                          <span className="text-[9px] text-slate-400 font-mono font-semibold" title="Weighted Contribution">
                                            {weightedScore}
                                          </span>
                                        </div>
                                      </td>
                                    );
                                  })}

                                  <td className="p-3 text-center border-l-2 border-slate-200 bg-indigo-50/10">
                                    <div className="inline-flex flex-col gap-0.5" id={`comp_score_matrix_${ent.id}`}>
                                      <span className="font-mono text-sm font-semibold text-indigo-950 bg-indigo-50 border border-indigo-150 py-0.5 px-2 rounded-md">
                                        {((scoreData.score / 5) * 100).toFixed(1)}%
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-3 text-center border-l border-slate-100 bg-indigo-50/10">
                                    <span className="font-mono text-sm font-semibold text-indigo-950 bg-indigo-50 border border-indigo-150 py-0.5 px-2 rounded-md">
                                      {scoreData.score.toFixed(1)}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center border-l border-slate-100">
                                    <span className={`text-[9px] font-semibold border uppercase px-2 py-0.5 rounded-full inline-block ${targetColor.bgColor}`}>
                                      {scoreData.level}
                                    </span>
                                  </td>
                                </tr>
                              );
                            }))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Status legend foot workspace bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-500 font-medium flex flex-wrap gap-x-6 gap-y-2 justify-between">
                <div className="flex gap-4 items-center">
                  <span><strong>Evaluation Keys:</strong></span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-100 border border-emerald-300 rounded" /> Minimal / Low</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-amber-100 border border-amber-300 rounded" /> Medium Risk</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-orange-100 border border-orange-300 rounded" /> Significant Risk</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-100 border border-red-350 rounded" /> Critical Danger</span>
                </div>
                <span>* Rates are fully customizable. Click cell select boxes or stepping tags to modulate impact weights and recalculate live.</span>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: RISK ASSESSMENT SETUP */}
      {activeSubTab === 'Setup' && (
        <div className="space-y-6 animate-fade-in" id="setup_panel">
          
          <div className="bg-white p-6 rounded-xl border border-slate-205 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                Risk Assessment Setup
              </h3>
              <p className="text-xs text-slate-500 mt-1">Configure the corresponding risk factors and weights for each configured Auditing Division.</p>
            </div>

            <div className="space-y-6">
              {validAuditingUnits.map(cat => {
                const groupFactors = riskFactors.filter(f => f.applicableCategories?.includes(cat));
                const totalWeight = groupFactors.reduce((sum, f) => sum + f.weight, 0);

                return (
                  <div key={cat} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        <h4 className="font-bold text-slate-800 text-sm uppercase">{cat}</h4>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold px-2 py-1 rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200">
                          Total Weight: {totalWeight}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteTaxonomyCategory(cat)}
                          className="text-slate-400 hover:text-red-650 p-1 rounded-lg hover:bg-red-50 transition-colors"
                          title={`Delete Category: ${cat}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Factors List */}
                      {groupFactors.length > 0 ? (
                        <div className="space-y-2">
                          {groupFactors.map(factor => (
                            <div key={factor.id} className="flex flex-col md:flex-row justify-between md:items-center gap-4 p-3 bg-white border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
                              <div className="flex-1">
                                <span className="font-bold text-slate-800 text-xs">{factor.name}</span>
                                <p className="text-[10px] text-slate-500 mt-0.5 truncate">{factor.description}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="space-y-1 w-32">
                                  <div className="flex justify-between text-[9px] font-bold">
                                    <span className="text-slate-400">Weight:</span>
                                    <span className="text-indigo-600 font-mono">{factor.weight}%</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    step="5"
                                    value={factor.weight}
                                    onChange={e => handleUpdateFactorWeight(factor.id, parseInt(e.target.value))}
                                    className="w-full h-1 mt-0.5 accent-indigo-600 cursor-pointer"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRiskFactor(factor.id, factor.name)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200"
                                  title="Delete factor"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No risk factors configured for {cat}.</p>
                      )}

                      {/* Add Factor Inline Form */}
                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const nameInput = form.elements.namedItem('factorName') as HTMLInputElement;
                          const typeInput = form.elements.namedItem('factorType') as HTMLSelectElement;
                          const weightInput = form.elements.namedItem('factorWeight') as HTMLInputElement;
                          
                          if (!nameInput.value.trim()) return;
                          
                          const newId = `rf-custom-${Date.now()}`;
                          const addedFactor: RiskFactor = {
                            id: newId,
                            name: nameInput.value.trim(),
                            category: typeInput.value as 'Impact' | 'Likelihood',
                            weight: parseInt(weightInput.value) || 0,
                            description: `Risk factor for ${cat}`,
                            applicableCategories: [cat]
                          };

                          setRiskFactors((prev) => [...prev, addedFactor]);
                          onLogAction('Risk Setup Modification', `Added ${nameInput.value} to ${cat}`);
                          
                          nameInput.value = '';
                          weightInput.value = '10';
                        }} 
                        className="flex flex-wrap gap-2 items-end pt-2 border-t border-slate-100"
                      >
                        <div className="flex-1 min-w-[200px] space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">New Risk Factor Name</label>
                          <input
                            type="text"
                            name="factorName"
                            required
                            placeholder="e.g. System Uptime, Access Rights..."
                            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-600"
                          />
                        </div>
                        <div className="w-28 space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Type</label>
                          <select
                            name="factorType"
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-indigo-600"
                          >
                            <option value="Impact">Impact</option>
                            <option value="Likelihood">Likelihood</option>
                          </select>
                        </div>
                        <div className="w-20 space-y-1">
                          <label className="text-[10px] text-slate-500 font-bold uppercase">Wt (%)</label>
                          <input
                            type="number"
                            name="factorWeight"
                            required
                            min="0"
                            max="100"
                            defaultValue="10"
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold focus:outline-none focus:border-indigo-600 text-center"
                          />
                        </div>
                        <button
                          type="submit"
                          className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg cursor-pointer h-[30px] flex items-center gap-1 transition-colors"
                        >
                          <Plus className="w-3 h-3" /> Add Factor
                        </button>
                      </form>

                    </div>
                  </div>
                );
              })}
            </div>
            {validAuditingUnits.length === 0 && (
              <p className="text-sm text-center text-slate-500 py-8 italic">No audit groups found. Create one to get started.</p>
            )}

            <div className="pt-6 border-t border-slate-150 flex justify-end">

            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ANNUAL WORK PLAN CALENDAR AND SIGN-OFF TABLE */}
      {activeSubTab === 'Plan' && (
        <div className="space-y-6" id="annual_plan_panel">
          {(() => {
            const filteredAnnualPlan = evaluatedEntities
              .filter(ent => !ent.hasNoFactors && ent.calcScore >= minScoreThreshold)
              .map((ent, idx) => {
                let targetQ: 'Q1' | 'Q2' | 'Q3' | 'Q4' = 'Q4';
                if (ent.calcLevel === 'High') targetQ = 'Q1';
                else if (ent.calcLevel === 'Medium') targetQ = 'Q2';
                
                let resources = 2;
                if (ent.calcLevel === 'High') resources = 3;
                else if (ent.calcLevel === 'Medium') resources = 2;
                else resources = 1;

                const approvedItem = annualPlan.find(p => p.entityId === ent.id && p.auditYear === selectedYear && p.status === 'Approved');
                const draftItem = annualPlan.find(p => p.entityId === ent.id && p.auditYear === selectedYear && p.status !== 'Approved');

                // Check if the risk assessment has changed since approval
                let hasAssessmentChanged = false;
                if (approvedItem) {
                  const hasApprovedRatesRecorded = !!(approvedItem as any).approvedRates;
                  if (hasApprovedRatesRecorded) {
                    const rateDiffers = riskFactors.some(factor => {
                      const approvedRate = (approvedItem as any).approvedRates?.[factor.id];
                      const currentRate = matrixRates[ent.id]?.[factor.id];
                      if (typeof approvedRate === 'number' && typeof currentRate === 'number') {
                        return approvedRate !== currentRate;
                      }
                      return false;
                    });
                    if (rateDiffers) {
                      hasAssessmentChanged = true;
                    }
                  } else {
                    if (ent.calcScore !== approvedItem.riskScore || ent.calcLevel !== approvedItem.riskLevel) {
                      hasAssessmentChanged = true;
                    }
                  }
                }

                // If approved and not changed, status is Approved. Otherwise Draft/from draftItem
                let status: 'Draft' | 'Submitted' | 'Approved' = 'Draft';
                if (approvedItem) {
                  if (hasAssessmentChanged) {
                    status = 'Draft';
                  } else {
                    status = 'Approved';
                  }
                } else if (draftItem) {
                  status = draftItem.status;
                }

                return {
                  id: draftItem?.id || approvedItem?.id || `p-${ent.id}`,
                  auditYear: selectedYear,
                  entityId: ent.id,
                  entityName: ent.name,
                  riskLevel: ent.calcLevel as 'High' | 'Medium' | 'Low',
                  riskScore: ent.calcScore,
                  targetQuarter: draftItem?.targetQuarter || approvedItem?.targetQuarter || targetQ,
                  targetMonth: draftItem?.targetMonth || approvedItem?.targetMonth || ((targetQ as string) === 'Q1' ? 'January' : (targetQ as string) === 'Q2' ? 'April' : (targetQ as string) === 'Q3' ? 'July' : 'October'),
                  assignedResources: draftItem?.assignedResources !== undefined ? draftItem.assignedResources : (approvedItem?.assignedResources !== undefined ? approvedItem.assignedResources : resources),
                  status: status,
                  approvedBy: status === 'Approved' ? approvedItem?.approvedBy : undefined,
                  approvalDate: status === 'Approved' ? approvedItem?.approvalDate : undefined,
                  approvedRates: approvedItem?.approvedRates
                };
              });

            // Split into Draft and Approved
            // Draft shows only unapproved draft/submitted items, keeping approved separate
            // Approved shows strictly persisted approved items in annualPlan (frozen and unaffected by risk assessment fluctuations)
            const displayedPlan = planTab === 'Draft'
              ? filteredAnnualPlan.filter(p => p.status !== 'Approved')
              : annualPlan.filter(p => p.status === 'Approved' && p.auditYear === selectedYear);

            return (
              <>
                {/* Admin mass approvals endorsement banner */}
                {activeRole === 'Admin' && displayedPlan.some(p => p.status === 'Submitted') && (
                  <div className="bg-indigo-50 border border-indigo-150 rounded-xl p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in" id="admin_approval_banner">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-indigo-600 animate-pulse" />
                        Chief Board Endorsements Required
                      </h4>
                      <p className="text-xs text-indigo-900 font-medium">
                        Review submitted scheduling proposals below. Sign off and persist approval states securely for corporate boardroom logs.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        let updated = [...annualPlan];
                        filteredAnnualPlan.forEach(p => {
                          if (p.status === 'Submitted') {
                            const ent = evaluatedEntities.find(e => e.id === p.entityId);
                            if (ent) {
                              updated = updated.filter(item => item.id !== `p-${ent.id}-approved` && (item.entityId !== ent.id || item.status !== 'Approved' || item.auditYear !== selectedYear));
                              updated.push({
                                ...p,
                                id: `p-${ent.id}-approved`,
                                status: 'Approved',
                                approvedBy: 'Abebe Kebede',
                                approvalDate: new Date().toISOString().split('T')[0],
                                approvedRates: { ...(matrixRates[ent.id] || {}) } as any
                              });
                            }
                          }
                        });
                        onUpdateAnnualPlan(updated);
                        onLogAction('Board Endorsement', `Mass approved all pending annual plan schedules for ${selectedYear}`);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      <CheckSquare className="w-4 h-4 text-white" />
                      Approve All Pending Proposals
                    </button>
                  </div>
                )}

                {/* Sub Tab Selection in Annual Audit Plan */}
                <div className="flex border-b border-slate-200 gap-4" id="plan_internal_tabs">
                  <button
                    onClick={() => setPlanTab('Draft')}
                    className={`pb-3 px-6 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                      planTab === 'Draft'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Draft Plan Tab
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${planTab === 'Draft' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                      {filteredAnnualPlan.filter(p => p.status !== 'Approved').length}
                    </span>
                  </button>
                  <button
                    onClick={() => setPlanTab('Approved')}
                    className={`pb-3 px-6 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                      planTab === 'Approved'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Approved Plan Tab
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${planTab === 'Approved' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                      {annualPlan.filter(p => p.status === 'Approved' && p.auditYear === selectedYear).length}
                    </span>
                  </button>
                </div>

                {/* Current Work plan Table */}
                <div className="bg-white rounded-xl border border-slate-202 shadow-sm overflow-hidden" id="plan_table_card">
                  <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/10">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase">
                        {planTab === 'Draft' ? 'Draft' : 'Approved'} Annual Audit Plan ({selectedYear})
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium leading-normal">
                        {planTab === 'Draft' 
                          ? 'Current risk assessment results compiled based on Multi-Factor matrices. Propose timeline and resources in active assignments.'
                          : 'Formally signed and approved audit timeline schedules registered by standard board committee.'}
                      </p>
                    </div>
                    <div className="bg-slate-100 hover:bg-slate-200 border border-slate-210 text-slate-700 text-[11px] px-3 py-1 rounded-lg font-bold flex items-center gap-1 shrink-0">
                      <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                      Active Calendars Count: {displayedPlan.length} Objective Tasks
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse font-sans" id="plan_table_element">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <th className="p-4">Objective Target Unit</th>
                          {riskFactors.map(f => (
                            <th key={f.id} className="p-4 text-center" title={f.description}>
                              <span className="block text-[8px] font-semibold text-indigo-650 tracking-wider">
                                {f.category}
                              </span>
                              {f.name}
                            </th>
                          ))}
                          <th className="p-4">Matrix Calculated Risk Score</th>
                          {planTab !== 'Draft' && (
                            <>
                              <th className="p-4">Target Timeline Slot</th>
                              <th className="p-4 text-center">Allocated Audit Resources</th>
                            </>
                          )}
                          <th className="p-4">Plan Status</th>
                          <th className="p-4 text-center">Sign-Off Endorsement</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs text-slate-705">
                        {displayedPlan.length === 0 ? (
                          <tr>
                            <td colSpan={riskFactors.length + (planTab === 'Draft' ? 4 : 6)} className="p-8 text-center text-slate-400 font-bold italic bg-slate-50/50">
                              {planTab === 'Draft' 
                                ? "No draft planning items currently meet the rating index requirements."
                                : "No endorsed and approved audit programs registered for this year yet."}
                            </td>
                          </tr>
                        ) : (
                          displayedPlan.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors" id={`plan_row_${item.id}`}>
                              <td className="p-4 font-extrabold text-slate-900 text-[13px]">
                                {item.entityName}
                              </td>

                              {riskFactors.map(factor => {
                                const rate = matrixRates[item.entityId]?.[factor.id];
                                const ent = universe.find(u => u.id === item.entityId);
                                const isUnassigned = !factor.applicableCategories || factor.applicableCategories.length === 0 || factor.applicableCategories.includes('Unassigned');
                                const isGlobal = factor.applicableCategories?.includes('All');
                                
                                let isApplicable = isGlobal || isUnassigned;
                                if (!isApplicable && ent?.auditingUnit) {
                                  isApplicable = factor.applicableCategories.includes(ent.auditingUnit);
                                }

                                return (
                                  <td key={factor.id} className="p-4 text-center">
                                    {isApplicable ? (
                                      <span className={`font-mono text-xs font-bold ${rate > 3 ? 'text-red-650' : rate < 3 ? 'text-emerald-650' : 'text-amber-600'}`}>
                                        {rate || 3}
                                      </span>
                                    ) : (
                                      <span className="text-slate-300 font-mono">-</span>
                                    )}
                                  </td>
                                );
                              })}

                              <td className="p-4">
                                <div className="flex items-center gap-2" id={`plan_risk_${item.id}`}>
                                  <span className="font-mono text-slate-950 font-semibold bg-slate-100 border border-slate-205 px-2 py-0.5 rounded-md text-xs">
                                    {item.riskScore}
                                  </span>
                                  {item.riskLevel === 'High' && (
                                    <span className="text-[9px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded-md uppercase">High</span>
                                  )}
                                  {item.riskLevel === 'Medium' && (
                                    <span className="text-[9px] bg-amber-100 text-amber-801 font-bold px-1.5 py-0.5 rounded-md uppercase">Medium</span>
                                  )}
                                  {item.riskLevel === 'Low' && (
                                    <span className="text-[9px] bg-emerald-100 text-emerald-850 font-bold px-1.5 py-0.5 rounded-md uppercase">Low</span>
                                  )}
                                </div>
                              </td>

                              {planTab !== 'Draft' && (
                                <>
                                  <td className="p-4">
                                    <div className="space-y-1" id={`timeline_${item.id}`}>
                                      <span className="font-extrabold text-indigo-900 text-xs bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md inline-block">
                                        {item.targetQuarter}
                                      </span>
                                      <span className="text-[10px] text-slate-500 block font-medium">Scheduled month: <strong className="text-slate-700">{item.targetMonth}</strong></span>
                                    </div>
                                  </td>

                                  <td className="p-4 text-center font-mono font-bold text-slate-900">
                                    {item.assignedResources} Team Auditors Assigned
                                  </td>
                                </>
                              )}

                              <td className="p-4">
                                <div id={`status_badge_${item.id}`}>
                                  {item.status === 'Draft' && (
                                    <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-750 border border-slate-200 text-[10px] uppercase font-bold font-mono">Draft State</span>
                                  )}
                                  {item.status === 'Submitted' && (
                                    <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] uppercase font-mono font-bold animate-pulse">Submitted Board</span>
                                  )}
                                  {item.status === 'Approved' && (
                                    <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-850 border border-emerald-250 text-[10px] uppercase font-bold font-mono">Approved Signoff</span>
                                  )}
                                </div>
                              </td>

                              <td className="p-4 text-center">
                                {item.status === 'Approved' ? (
                                  <div className="space-y-0.5" id={`approval_meta_${item.id}`}>
                                    <span className="text-[9px] block font-bold text-emerald-800">Approved by CEO-CA:</span>
                                    <span className="text-[10px] block text-slate-700 font-mono font-bold leading-tight">{item.approvedBy}</span>
                                    <span className="text-[9px] block text-slate-400 font-mono italic font-semibold">{item.approvalDate}</span>
                                  </div>
                                ) : activeRole === 'Admin' ? (
                                  <div className="flex gap-1 justify-center" id={`endorsement_actions_${item.id}`}>
                                    <button
                                      onClick={() => handlePlanStatusUpdate(item.id, 'Approved', 'Abebe Kebede')}
                                      className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-2.5 py-1 text-[10px] rounded font-bold cursor-pointer transition-colors"
                                    >
                                      Sign Approval
                                    </button>
                                    <button
                                      onClick={() => handlePlanStatusUpdate(item.id, 'Draft', 'Abebe Kebede')}
                                      className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 px-2.5 py-1 text-[10px] rounded font-bold cursor-pointer transition-colors"
                                    >
                                      Reject Slot
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic font-bold">Review Level Pending</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}



      {/* Editing Entity overlay */}
      {editingUniverseEntity && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="edit_entity_modal_risk">
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
                  {categoriesList.length > 0 ? (
                    categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  ) : (
                    ["Financial Operations", "IT Systems & Security", "Compliance & Legal", "Strategic Risks", "Human Resources"].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))
                  )}
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
                  className="block w-full px-3 py-2 bg-white border border-slate-250 rounded-lg text-xs focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 font-medium cursor-pointer"
                >
                  {(() => {
                    let units = [
                      'Branch Audit Division',
                      'Financial & Ops Section',
                      'Compliance & Fraud Investigation Division'
                    ];
                    return units
                      .filter(u => u.toLowerCase() !== 'follow up team')
                      .map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ));
                  })()}
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

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100" id="edit_actions_risk">
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



      </div>{/* End Main Layout Content Area */}
      </div>{/* End Main Layout Flex Row */}

    </div>
  );
}
