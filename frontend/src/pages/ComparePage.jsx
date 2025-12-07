import { useState, useEffect } from "react";
import { Plus, X, Check, ExternalLink, ArrowRightLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
// Updated imports to use the new API structure
import { toolsAPI, categoriesAPI } from "@/services/api";

const ComparePage = () => {
  // --- STATE ---
  const [slot1, setSlot1] = useState(null);
  const [slot2, setSlot2] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null); // 1 or 2

  // Data State
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availableTools, setAvailableTools] = useState([]);
  const [loadingTools, setLoadingTools] = useState(false);

  // --- EFFECTS ---

  // Load categories on mount
  useEffect(() => {
    categoriesAPI.getAll().then((res) => setCategories(res.data));
  }, []);

  // Load tools when modal is open or category changes
  useEffect(() => {
    if (isModalOpen) {
      setLoadingTools(true);
      const params = selectedCategory === "all" ? {} : { category_id: selectedCategory };
      
      // Use toolsAPI.getAll instead of getTools
      toolsAPI.getAll(params)
        .then((res) => setAvailableTools(res.data))
        .catch(err => console.error("Failed to load tools", err))
        .finally(() => setLoadingTools(false));
    }
  }, [selectedCategory, isModalOpen]);

  // --- HANDLERS ---

  const openModal = (slotNum) => {
    setActiveSlot(slotNum);
    setIsModalOpen(true);
    setSelectedCategory("all"); // Reset filter on open
  };

  const handleSelectTool = (tool) => {
    if (activeSlot === 1) {
      if (slot2?.id === tool.id) return; // Prevent duplicate
      setSlot1(tool);
    } else {
      if (slot1?.id === tool.id) return; // Prevent duplicate
      setSlot2(tool);
    }
    setIsModalOpen(false);
  };

  const clearSlot = (slotNum) => {
    if (slotNum === 1) setSlot1(null);
    else setSlot2(null);
  };

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen font-sans">
      <div className="mb-12 text-center space-y-4">
        <h1 className="text-4xl font-bold text-white tracking-tight">Compare AI Tools</h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Select two tools to see a side-by-side breakdown of their features, pricing, and details.
        </p>
      </div>

      {/* --- SELECTION SLOTS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
        <SelectionCard
          tool={slot1}
          slotNumber={1}
          onAdd={() => openModal(1)}
          onRemove={() => clearSlot(1)}
          otherToolId={slot2?.id}
        />
        <SelectionCard
          tool={slot2}
          slotNumber={2}
          onAdd={() => openModal(2)}
          onRemove={() => clearSlot(2)}
          otherToolId={slot1?.id}
        />
      </div>

      {/* --- COMPARISON TABLE --- */}
      {slot1 && slot2 ? (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden shadow-2xl">
            {/* Header Row */}
            <div className="grid grid-cols-3 bg-slate-900/80 border-b border-slate-800 p-4">
              <div className="font-semibold text-slate-400 uppercase tracking-wider text-xs flex items-center">Feature</div>
              <div className="font-bold text-white text-lg text-center border-l border-slate-800">{slot1.name}</div>
              <div className="font-bold text-white text-lg text-center border-l border-slate-800">{slot2.name}</div>
            </div>

            <ComparisonRow
              label="Pricing Model"
              val1={<Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 px-3 py-1">{slot1.pricing_type}</Badge>}
              val2={<Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 px-3 py-1">{slot2.pricing_type}</Badge>}
            />

            <ComparisonRow
              label="Categories"
              val1={
                <div className="flex flex-wrap gap-2 justify-center">
                  {slot1.categories.map(c => (
                    <Badge key={c.id} variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700">
                      {c.name}
                    </Badge>
                  ))}
                </div>
              }
              val2={
                <div className="flex flex-wrap gap-2 justify-center">
                  {slot2.categories.map(c => (
                    <Badge key={c.id} variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-700">
                      {c.name}
                    </Badge>
                  ))}
                </div>
              }
            />

            <ComparisonRow
              label="Description"
              val1={<p className="text-sm text-slate-400 leading-relaxed text-left">{slot1.description}</p>}
              val2={<p className="text-sm text-slate-400 leading-relaxed text-left">{slot2.description}</p>}
            />

            <ComparisonRow
              label="Action"
              isLast
              val1={
                <Button className="w-full bg-white text-slate-950 hover:bg-slate-200 font-semibold" onClick={() => window.open(slot1.link, '_blank')}>
                  Visit Website <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              }
              val2={
                <Button className="w-full bg-white text-slate-950 hover:bg-slate-200 font-semibold" onClick={() => window.open(slot2.link, '_blank')}>
                  Visit Website <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        /* Empty State Placeholder */
        <div className="text-center py-16 opacity-50">
          <div className="inline-flex items-center justify-center p-6 bg-slate-900 rounded-full mb-6 border border-slate-800">
            <ArrowRightLeft className="h-10 w-10 text-slate-600" />
          </div>
          <p className="text-xl text-slate-500 font-medium">Add tools to both slots to unlock the comparison.</p>
        </div>
      )}

      {/* --- SELECTION MODAL --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl h-[85vh] bg-slate-950 border-slate-800 flex flex-col p-0 gap-0 overflow-hidden shadow-2xl">
          
          {/* Modal Header */}
          <DialogHeader className="p-6 pb-4 border-b border-slate-800 bg-slate-950 z-10 shrink-0">
            <DialogTitle className="text-2xl font-bold text-white mb-4">Select Tool for Slot {activeSlot}</DialogTitle>
            
            {/* Horizontal Category Scroll */}
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-2 pb-2">
                <FilterPill
                  active={selectedCategory === "all"}
                  onClick={() => setSelectedCategory("all")}
                >
                  All Categories
                </FilterPill>
                {categories.map((cat) => (
                  <FilterPill
                    key={cat.id}
                    active={selectedCategory === cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.name}
                  </FilterPill>
                ))}
              </div>
            </ScrollArea>
          </DialogHeader>

          {/* Tools Grid */}
          <ScrollArea className="flex-1 p-6 bg-slate-950">
            {loadingTools ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-40 bg-slate-900 rounded-lg animate-pulse border border-slate-800" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTools.map((tool) => {
                  // Check if this tool is already selected in the OTHER slot
                  const isAlreadySelected = (activeSlot === 1 && slot2?.id === tool.id) || (activeSlot === 2 && slot1?.id === tool.id);
                  
                  return (
                    <div
                      key={tool.id}
                      onClick={() => !isAlreadySelected && handleSelectTool(tool)}
                      className={`
                        group relative p-5 rounded-xl border transition-all duration-200 flex flex-col h-full
                        ${isAlreadySelected
                          ? 'border-slate-800 bg-slate-900/30 opacity-40 cursor-not-allowed grayscale'
                          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 hover:border-blue-500/50 hover:shadow-lg hover:-translate-y-1 cursor-pointer'}
                      `}
                    >
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="font-bold text-slate-100 text-lg group-hover:text-blue-400 transition-colors line-clamp-1">{tool.name}</h3>
                         {isAlreadySelected && <Check className="h-5 w-5 text-green-500" />}
                      </div>
                      
                      <p className="text-sm text-slate-400 line-clamp-2 mb-4 flex-grow">{tool.description}</p>
                      
                      <div className="flex gap-2 mt-auto">
                         <Badge variant="secondary" className="bg-slate-950 text-xs">{tool.pricing_type}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loadingTools && availableTools.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <Search className="h-12 w-12 mb-4 opacity-20" />
                <p>No tools found in this category.</p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const SelectionCard = ({ tool, onAdd, onRemove, slotNumber }) => {
  if (!tool) {
    return (
      <div
        onClick={onAdd}
        className="h-72 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-900/20 flex flex-col items-center justify-center cursor-pointer hover:border-slate-600 hover:bg-slate-900/40 transition-all group relative overflow-hidden"
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
        
        <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-slate-700 transition-all shadow-xl z-10">
          <Plus className="h-8 w-8 text-slate-400 group-hover:text-white" />
        </div>
        <h3 className="text-xl font-semibold text-slate-300 group-hover:text-white z-10">Add Tool {slotNumber}</h3>
        <p className="text-sm text-slate-500 mt-2 z-10">Click to select from library</p>
      </div>
    );
  }

  return (
    <div className="h-72 relative rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-900 to-slate-950 p-8 flex flex-col items-center justify-center text-center shadow-2xl group">
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="absolute top-3 right-3 text-slate-500 hover:text-red-400 hover:bg-red-950/30 rounded-full transition-colors"
      >
        <X className="h-5 w-5" />
      </Button>

      <div className="h-24 w-24 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 text-4xl font-bold text-blue-500 shadow-inner">
        {tool.name.charAt(0)}
      </div>

      <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{tool.name}</h3>
      <p className="text-sm text-slate-400 line-clamp-1 max-w-xs">{tool.tagline || "AI Tool Description"}</p>
    </div>
  );
};

const ComparisonRow = ({ label, val1, val2, isLast }) => (
  <div className={`grid grid-cols-3 ${!isLast ? 'border-b border-slate-800' : ''} hover:bg-slate-800/30 transition-colors`}>
    <div className="p-6 flex items-center text-sm font-semibold text-slate-500 uppercase tracking-wider bg-slate-950/20">
      {label}
    </div>
    <div className="p-6 text-slate-200 border-l border-slate-800 flex items-center justify-center text-center">
      {val1}
    </div>
    <div className="p-6 text-slate-200 border-l border-slate-800 flex items-center justify-center text-center">
      {val2}
    </div>
  </div>
);

const FilterPill = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`
      px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border
      ${active
        ? "bg-white text-slate-950 border-white shadow-md scale-105"
        : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-600 hover:bg-slate-800"}
    `}
  >
    {children}
  </button>
);

export default ComparePage;