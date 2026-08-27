import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Plot, Society, SvgZone, User } from '../../types';
import { 
  MapPin, 
  Layers, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Building2, 
  SlidersHorizontal,
  DollarSign,
  Scale,
  Sparkles,
  ArrowRight,
  Info,
  Calendar,
  CreditCard,
  X,
  ExternalLink,
  Navigation,
  Globe
} from 'lucide-react';

interface DualLayerPlotMapProps {
  society: Society;
  plots: Plot[];
  svgZones?: SvgZone[];
  currentUser?: User;
  selectedPlotId?: string | null;
  onSelectPlot?: (plot: Plot) => void;
  onBookPlot?: (plot: Plot) => void;
  onToggleCompare?: (plot: Plot) => void;
  comparedPlotIds?: string[];
  initialLayer?: 'svg_masterplan' | 'google_maps';
  isDealerView?: boolean;
  assignedPlotIds?: string[];
}

type LayerMode = 'svg_masterplan' | 'google_maps' | 'split_view';
type ColorSchemeMode = 'status' | 'size' | 'price' | 'category';

export const DualLayerPlotMap: React.FC<DualLayerPlotMapProps> = ({
  society,
  plots = [],
  svgZones = [],
  currentUser,
  selectedPlotId,
  onSelectPlot,
  onBookPlot,
  onToggleCompare,
  comparedPlotIds = [],
  initialLayer = 'svg_masterplan',
  isDealerView = false,
  assignedPlotIds = []
}) => {
  const [activeLayer, setActiveLayer] = useState<LayerMode>(initialLayer);
  const [colorMode, setColorMode] = useState<ColorSchemeMode>('status');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activePlot, setActivePlot] = useState<Plot | null>(null);
  const [hoveredPlot, setHoveredPlot] = useState<Plot | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [mapDimensions, setMapDimensions] = useState<{ width: number; height: number }>({ width: 850, height: 550 });
  const [satelliteMode, setSatelliteMode] = useState<boolean>(false);
  const [livePulse, setLivePulse] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  // Filter plots based on dealer restriction or society selection
  const relevantPlots = useMemo(() => {
    let list = plots.filter(p => p.societyId === society.id);
    if (isDealerView && assignedPlotIds.length > 0) {
      // In Dealer mode, restricted strictly to assigned lots
      list = list.filter(p => assignedPlotIds.includes(p.id) || p.dealerId === currentUser?.id);
    }
    return list;
  }, [plots, society.id, isDealerView, assignedPlotIds, currentUser]);

  // Sync selectedPlotId prop with internal state
  useEffect(() => {
    if (selectedPlotId) {
      const found = relevantPlots.find(p => p.id === selectedPlotId);
      if (found) setActivePlot(found);
    }
  }, [selectedPlotId, relevantPlots]);

  // Extract unique sectors and blocks
  const sectors = useMemo(() => {
    const s = new Set<string>();
    relevantPlots.forEach(p => { if (p.sector) s.add(p.sector); });
    return Array.from(s);
  }, [relevantPlots]);

  const blocks = useMemo(() => {
    const b = new Set<string>();
    relevantPlots.forEach(p => { if (p.block) b.add(p.block); });
    return Array.from(b);
  }, [relevantPlots]);

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          const height = Math.max(480, Math.min(620, Math.round(width * 0.62)));
          setMapDimensions({ width, height });
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Status counts for society dashboard
  const statusCounts = useMemo(() => {
    const avail = relevantPlots.filter(p => p.status === 'available').length;
    const res = relevantPlots.filter(p => p.status === 'reserved').length;
    const sold = relevantPlots.filter(p => p.status === 'sold').length;
    const disp = relevantPlots.filter(p => p.isDisputed || p.status === 'disputed').length;
    const comm = relevantPlots.filter(p => p.category === 'commercial').length;
    return { avail, res, sold, disp, comm, total: relevantPlots.length };
  }, [relevantPlots]);

  // Color mapping logic
  const getPlotColors = (plot: Plot) => {
    if (plot.isDisputed || plot.status === 'disputed') {
      return { fill: '#e11d48', stroke: '#9f1239', text: '#ffffff', label: 'Disputed' };
    }

    if (colorMode === 'status') {
      if (plot.category === 'commercial') {
        return { fill: '#7c3aed', stroke: '#5b21b6', text: '#ffffff', label: 'Commercial' };
      }
      switch (plot.status) {
        case 'available':
          return { fill: '#10b981', stroke: '#047857', text: '#ffffff', label: 'Available' };
        case 'reserved':
          return { fill: '#f59e0b', stroke: '#b45309', text: '#ffffff', label: 'Reserved' };
        case 'sold':
          return { fill: '#64748b', stroke: '#334155', text: '#cbd5e1', label: 'Sold' };
        default:
          return { fill: '#10b981', stroke: '#047857', text: '#ffffff', label: 'Available' };
      }
    } else if (colorMode === 'size') {
      if (plot.sizeMarla <= 3) return { fill: '#0284c7', stroke: '#0369a1', text: '#ffffff', label: '3 Marla' };
      if (plot.sizeMarla <= 5) return { fill: '#10b981', stroke: '#047857', text: '#ffffff', label: '5 Marla' };
      if (plot.sizeMarla <= 7) return { fill: '#f59e0b', stroke: '#b45309', text: '#ffffff', label: '7 Marla' };
      if (plot.sizeMarla <= 10) return { fill: '#8b5cf6', stroke: '#6d28d9', text: '#ffffff', label: '10 Marla' };
      return { fill: '#dc2626', stroke: '#991b1b', text: '#ffffff', label: '1 Kanal (20M)' };
    } else if (colorMode === 'price') {
      const minP = 1500000;
      const maxP = 7500000;
      const t = Math.min(1, Math.max(0, (plot.pricePKR - minP) / (maxP - minP)));
      const color = d3.interpolateViridis(t);
      return { fill: color, stroke: d3.rgb(color).darker(0.8).formatHex(), text: '#ffffff', label: `PKR ${(plot.pricePKR / 100000).toFixed(1)}L` };
    } else {
      // category
      return plot.category === 'commercial' 
        ? { fill: '#7c3aed', stroke: '#5b21b6', text: '#ffffff', label: 'Commercial' }
        : { fill: '#0d9488', stroke: '#0f766e', text: '#ffffff', label: 'Residential' };
    }
  };

  // D3 SVG Renderer
  useEffect(() => {
    if (!svgRef.current || relevantPlots.length === 0 || activeLayer === 'google_maps') return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = mapDimensions.width;
    const height = mapDimensions.height;

    // Root Group
    const rootG = svg.append('g').attr('class', 'masterplan-root');

    // Zoom setup
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.6, 4])
      .on('zoom', (event) => {
        rootG.attr('transform', event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    // Initial transform to center
    svg.call(zoom.transform, d3.zoomIdentity.translate(20, 20).scale(0.95));

    // Defs for gradients & patterns
    const defs = svg.append('defs');

    // Grid Pattern for background
    const pattern = defs.append('pattern')
      .attr('id', 'masterplan-grid')
      .attr('width', 30)
      .attr('height', 30)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern.append('path')
      .attr('d', 'M 30 0 L 0 0 0 30')
      .attr('fill', 'none')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', '0.8');

    // Masterplan Background Boundary
    rootG.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 820)
      .attr('height', 520)
      .attr('rx', 24)
      .attr('fill', '#f8fafc')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2);

    rootG.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 820)
      .attr('height', 520)
      .attr('rx', 24)
      .attr('fill', 'url(#masterplan-grid)')
      .attr('opacity', 0.55);

    // 100 FT Main Boulevard
    const mainBoulevard = rootG.append('g').attr('class', 'main-boulevard');
    mainBoulevard.append('rect')
      .attr('x', 20)
      .attr('y', 215)
      .attr('width', 780)
      .attr('height', 50)
      .attr('fill', '#334155')
      .attr('rx', 6);

    // Dashed center line
    mainBoulevard.append('line')
      .attr('x1', 30)
      .attr('y1', 240)
      .attr('x2', 790)
      .attr('y2', 240)
      .attr('stroke', '#f8fafc')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '12,8');

    mainBoulevard.append('text')
      .attr('x', 410)
      .attr('y', 244)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f1f5f9')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('letter-spacing', '2px')
      .text('100 FT MAIN COMMERCIAL BOULEVARD');

    // Vertical 40 FT Sector Avenues
    const aveG = rootG.append('g').attr('class', 'sector-avenues');
    [195, 375, 595].forEach((xPos, idx) => {
      aveG.append('rect')
        .attr('x', xPos)
        .attr('y', 30)
        .attr('width', 22)
        .attr('height', 460)
        .attr('fill', '#475569')
        .attr('rx', 4);

      aveG.append('text')
        .attr('x', xPos + 11)
        .attr('y', 120)
        .attr('text-anchor', 'middle')
        .attr('fill', '#cbd5e1')
        .attr('font-size', '8px')
        .attr('font-weight', 'bold')
        .attr('transform', `rotate(-90 ${xPos + 11} 120)`)
        .text(`40 FT STREET ${idx + 1}`);
    });

    // Public Amenities: Central Park, Grand Mosque, Commercial Broadway
    const amenitiesG = rootG.append('g').attr('class', 'society-amenities');

    // Central Green Park
    amenitiesG.append('rect')
      .attr('x', 625)
      .attr('y', 40)
      .attr('width', 165)
      .attr('height', 160)
      .attr('rx', 16)
      .attr('fill', '#dcfce7')
      .attr('stroke', '#86efac')
      .attr('stroke-width', 2);

    amenitiesG.append('text')
      .attr('x', 707)
      .attr('y', 115)
      .attr('text-anchor', 'middle')
      .attr('fill', '#166534')
      .attr('font-size', '11px')
      .attr('font-weight', '900')
      .text('GRAND CENTRAL PARK');

    amenitiesG.append('text')
      .attr('x', 707)
      .attr('y', 132)
      .attr('text-anchor', 'middle')
      .attr('fill', '#15803d')
      .attr('font-size', '9px')
      .text('12 Kanal Landscaped Flora');

    // Jamia Mosque
    amenitiesG.append('rect')
      .attr('x', 625)
      .attr('y', 280)
      .attr('width', 165)
      .attr('height', 130)
      .attr('rx', 16)
      .attr('fill', '#fef3c7')
      .attr('stroke', '#fcd34d')
      .attr('stroke-width', 2);

    amenitiesG.append('text')
      .attr('x', 707)
      .attr('y', 345)
      .attr('text-anchor', 'middle')
      .attr('fill', '#92400e')
      .attr('font-size', '11px')
      .attr('font-weight', '900')
      .text('GRAND JAMIA MOSQUE');

    // Plot Zones Group
    const plotsG = rootG.append('g').attr('class', 'plot-demarcations');

    // Render individual plots with coordinate placement or SVG zone mapping
    relevantPlots.forEach((plot, index) => {
      // Check filters
      if (selectedSector !== 'all' && plot.sector !== selectedSector) return;
      if (selectedBlock !== 'all' && plot.block !== selectedBlock) return;
      if (statusFilter !== 'all' && plot.status !== statusFilter) return;

      const colors = getPlotColors(plot);
      const isSelected = activePlot?.id === plot.id;
      const isHovered = hoveredPlot?.id === plot.id;
      const isCompared = comparedPlotIds.includes(plot.id);

      // Compute geometric position
      let posX = 40;
      let posY = 40;
      let pWidth = 68;
      let pHeight = 72;

      // Check if SVG zone exists
      const zone = svgZones.find(z => z.plot_id === plot.id || z.plot_number === plot.plotNumber);
      if (zone?.coordinates) {
        posX = zone.coordinates.x;
        posY = zone.coordinates.y;
        pWidth = zone.coordinates.width || (plot.sizeMarla > 5 ? 88 : 68);
        pHeight = zone.coordinates.height || 72;
      } else {
        // Dynamic grid fallback
        const col = index % 6;
        const row = Math.floor(index / 6);
        const colOffsets = [40, 115, 225, 300, 405, 480];
        posX = colOffsets[col] || (40 + col * 75);
        posY = row === 0 ? 40 : (row === 1 ? 125 : (row === 2 ? 280 : 365));
        pWidth = plot.sizeMarla >= 10 ? 82 : (plot.sizeMarla <= 3 ? 56 : 68);
        pHeight = 72;
      }

      const plotGroup = plotsG.append('g')
        .attr('class', `plot-node plot-${plot.id}`)
        .attr('cursor', 'pointer')
        .on('click', () => {
          setActivePlot(plot);
          if (onSelectPlot) onSelectPlot(plot);
        })
        .on('mouseenter', (event) => {
          setHoveredPlot(plot);
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top
            });
          }
        })
        .on('mousemove', (event) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (rect) {
            setTooltipPos({
              x: event.clientX - rect.left,
              y: event.clientY - rect.top
            });
          }
        })
        .on('mouseleave', () => {
          setHoveredPlot(null);
          setTooltipPos(null);
        });

      // Outer boundary box
      plotGroup.append('rect')
        .attr('x', posX)
        .attr('y', posY)
        .attr('width', pWidth)
        .attr('height', pHeight)
        .attr('rx', 8)
        .attr('fill', colors.fill)
        .attr('stroke', isSelected ? '#ffffff' : colors.stroke)
        .attr('stroke-width', isSelected ? 3.5 : (isHovered ? 2.5 : 1.5))
        .attr('filter', isSelected ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.35))' : 'none');

      // Plot Number text
      plotGroup.append('text')
        .attr('x', posX + pWidth / 2)
        .attr('y', posY + 22)
        .attr('text-anchor', 'middle')
        .attr('fill', colors.text)
        .attr('font-size', '12px')
        .attr('font-weight', '900')
        .attr('font-family', 'system-ui, sans-serif')
        .text(plot.plotNumber);

      // Size Marla text
      plotGroup.append('text')
        .attr('x', posX + pWidth / 2)
        .attr('y', posY + 38)
        .attr('text-anchor', 'middle')
        .attr('fill', colors.text)
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .attr('opacity', 0.95)
        .text(`${plot.sizeMarla}M ${plot.category === 'commercial' ? 'Comm' : ''}`);

      // Status Pill / indicator
      plotGroup.append('rect')
        .attr('x', posX + 6)
        .attr('y', posY + pHeight - 20)
        .attr('width', pWidth - 12)
        .attr('height', 14)
        .attr('rx', 4)
        .attr('fill', 'rgba(0, 0, 0, 0.28)');

      plotGroup.append('text')
        .attr('x', posX + pWidth / 2)
        .attr('y', posY + pHeight - 9)
        .attr('text-anchor', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-size', '8px')
        .attr('font-weight', 'bold')
        .text(plot.isDisputed ? 'DISPUTED' : plot.status.toUpperCase());

      // Selection Ring
      if (isSelected) {
        plotGroup.append('rect')
          .attr('x', posX - 4)
          .attr('y', posY - 4)
          .attr('width', pWidth + 8)
          .attr('height', pHeight + 8)
          .attr('rx', 12)
          .attr('fill', 'none')
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 2.5)
          .attr('stroke-dasharray', '4,3');
      }

      // Compare Badge
      if (isCompared) {
        plotGroup.append('circle')
          .attr('cx', posX + pWidth - 4)
          .attr('cy', posY + 4)
          .attr('r', 8)
          .attr('fill', '#0284c7')
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 1.5);

        plotGroup.append('text')
          .attr('x', posX + pWidth - 4)
          .attr('y', posY + 7)
          .attr('text-anchor', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-size', '8px')
          .attr('font-weight', 'bold')
          .text('VS');
      }
    });

  }, [relevantPlots, activeLayer, colorMode, selectedSector, selectedBlock, statusFilter, activePlot, hoveredPlot, comparedPlotIds, mapDimensions, svgZones]);

  // Zoom control handlers
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 1.3);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(250).call(zoomBehaviorRef.current.scaleBy, 0.7);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current).transition().duration(300).call(
      zoomBehaviorRef.current.transform,
      d3.zoomIdentity.translate(20, 20).scale(0.95)
    );
  };

  return (
    <div id="dual-layer-plot-map-container" className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-slate-900">
      
      {/* Top Header Bar: Layer Switcher, Society Meta & Live Pulse */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>Dual-Layer Architecture</span>
            </span>

            {society.nocNumber && (
              <span className="bg-amber-100 text-amber-900 text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-amber-300">
                NOC #{society.nocNumber}
              </span>
            )}

            {isDealerView && (
              <span className="bg-teal-100 text-teal-900 text-[11px] font-bold px-2 py-0.5 rounded border border-teal-300">
                Dealer Restricted View ({relevantPlots.length} Lots Assigned)
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-extrabold font-[Outfit] text-slate-900 tracking-tight flex items-center gap-2">
            <span>{society.name}</span>
            <span className="text-xs font-normal text-slate-500 hidden sm:inline">({society.location})</span>
          </h3>
        </div>

        {/* Dual-Layer Toggle Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="inline-flex p-1 bg-slate-200/80 rounded-2xl border border-slate-300 text-xs font-bold w-full sm:w-auto">
            <button
              id="btn-layer-svg-masterplan"
              onClick={() => setActiveLayer('svg_masterplan')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
                activeLayer === 'svg_masterplan'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Layer 2: SVG Masterplan</span>
            </button>

            <button
              id="btn-layer-google-maps"
              onClick={() => setActiveLayer('google_maps')}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
                activeLayer === 'google_maps'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Layer 1: Google Maps</span>
            </button>

            <button
              id="btn-layer-split-view"
              onClick={() => setActiveLayer('split_view')}
              className={`hidden lg:flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl transition cursor-pointer ${
                activeLayer === 'split_view'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Dual View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Color Mode Ribbon (Shown for SVG View) */}
      {(activeLayer === 'svg_masterplan' || activeLayer === 'split_view') && (
        <div className="px-4 py-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-500 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>Color Mode:</span>
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setColorMode('status')}
                className={`px-2.5 py-1 rounded-md font-bold transition ${colorMode === 'status' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                Status
              </button>
              <button
                onClick={() => setColorMode('size')}
                className={`px-2.5 py-1 rounded-md font-bold transition ${colorMode === 'size' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                Size (Marla)
              </button>
              <button
                onClick={() => setColorMode('price')}
                className={`px-2.5 py-1 rounded-md font-bold transition ${colorMode === 'price' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
              >
                Price (PKR)
              </button>
            </div>

            {/* Sector filter */}
            {sectors.length > 0 && (
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold cursor-pointer"
              >
                <option value="all">All Sectors</option>
                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}

            {/* Block filter */}
            {blocks.length > 0 && (
              <select
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold cursor-pointer"
              >
                <option value="all">All Blocks</option>
                {blocks.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            )}

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-semibold cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available (Green)</option>
              <option value="reserved">Reserved (Yellow)</option>
              <option value="sold">Sold (Gray)</option>
            </select>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleZoomIn}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
        
        {/* Map Display Column */}
        <div className={`relative ${activePlot ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-300 min-h-[500px] bg-slate-950/5`}>
          
          {/* LAYER 1: GOOGLE MAPS */}
          {activeLayer === 'google_maps' && (
            <div className="w-full h-full min-h-[520px] relative bg-slate-100">
              <iframe
                title={`${society.name} Real-World Coordinates`}
                src={society.mapEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(society.name + ' ' + society.location + ' Pakistan')}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full min-h-[520px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl shadow-md border border-slate-200 max-w-xs text-xs space-y-1">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-800" />
                  <span>Geographical Coordinates</span>
                </div>
                <p className="text-slate-600 font-mono text-[11px]">
                  31.5204° N, 74.3587° E (Masterplan Coordinates)
                </p>
                <p className="text-[10px] text-slate-500">
                  Direct connectivity via 100 FT Main Circular Road with LDA/TMA approved bypass.
                </p>
              </div>
            </div>
          )}

          {/* LAYER 2: SVG MASTERPLAN */}
          {activeLayer === 'svg_masterplan' && (
            <div ref={containerRef} className="w-full h-full min-h-[520px] relative overflow-hidden bg-slate-50 p-2 sm:p-4">
              <svg
                ref={svgRef}
                width="100%"
                height={mapDimensions.height}
                className="w-full h-full select-none cursor-grab active:cursor-grabbing rounded-2xl"
              />

              {/* Hover Tooltip */}
              {hoveredPlot && tooltipPos && (
                <div
                  className="absolute pointer-events-none z-30 bg-slate-900/95 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 space-y-1 transform -translate-x-1/2 -translate-y-full -mt-3 max-w-xs"
                  style={{ left: tooltipPos.x, top: tooltipPos.y }}
                >
                  <div className="font-bold flex items-center justify-between gap-3 text-amber-400">
                    <span>Plot #{hoveredPlot.plotNumber}</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                      {hoveredPlot.sector}
                    </span>
                  </div>
                  <div className="text-slate-300 text-[11px]">
                    {hoveredPlot.sizeMarla} Marla ({hoveredPlot.sizeSqFt || hoveredPlot.sizeMarla * 225} Sq. Ft)
                  </div>
                  <div className="font-extrabold text-emerald-400 font-[Outfit]">
                    PKR {hoveredPlot.pricePKR.toLocaleString('en-PK')}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Click to open complete specs & booking
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SPLIT VIEW (Layer 1 + Layer 2 Side by Side) */}
          {activeLayer === 'split_view' && (
            <div className="grid grid-cols-1 md:grid-cols-2 h-full min-h-[520px]">
              {/* Left: Google Maps */}
              <div className="relative border-r border-slate-200 bg-slate-100">
                <iframe
                  title={`${society.name} Real-World Coordinates`}
                  src={society.mapEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(society.name + ' Pakistan')}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full min-h-[520px] border-0"
                  loading="lazy"
                />
                <div className="absolute bottom-3 left-3 bg-white/95 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-800 shadow-sm">
                  Layer 1: Real-World Location
                </div>
              </div>

              {/* Right: SVG Plot Map */}
              <div ref={containerRef} className="relative overflow-hidden bg-slate-50 p-2">
                <svg
                  ref={svgRef}
                  width="100%"
                  height={mapDimensions.height}
                  className="w-full h-full select-none cursor-grab active:cursor-grabbing rounded-xl"
                />
                <div className="absolute bottom-3 right-3 bg-white/95 px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-800 shadow-sm">
                  Layer 2: Demarcation Map
                </div>
              </div>
            </div>
          )}

          {/* Standard Color Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm p-2.5 rounded-2xl shadow-sm border border-slate-200 text-[11px] font-semibold text-slate-700 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600 inline-block" />
              <span>Available ({statusCounts.avail})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500 border border-amber-600 inline-block" />
              <span>Reserved ({statusCounts.res})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-500 border border-slate-600 inline-block" />
              <span>Sold ({statusCounts.sold})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-600 border border-purple-700 inline-block" />
              <span>Commercial Plaza ({statusCounts.comm})</span>
            </div>
            {statusCounts.disp > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-600 border border-rose-700 inline-block" />
                <span>Disputed ({statusCounts.disp})</span>
              </div>
            )}
          </div>

        </div>

        {/* Plot Inspector Detail Panel (Opens upon zone tap) */}
        {activePlot && (
          <div className="lg:col-span-4 bg-slate-900 text-white p-5 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between space-y-4">
            
            <div className="space-y-4">
              
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-amber-400/30">
                      ZONE: {activePlot.svgZoneId || `zone-${activePlot.plotNumber}`}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                      activePlot.status === 'available' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                      activePlot.status === 'reserved' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {activePlot.isDisputed ? 'DISPUTED / FROZEN' : activePlot.status}
                    </span>
                  </div>
                  <h4 className="text-xl font-black font-[Outfit] text-white mt-1">
                    Plot #{activePlot.plotNumber}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {activePlot.block} Block • {activePlot.sector}
                  </p>
                </div>

                <button
                  onClick={() => setActivePlot(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Price & Key Metrics */}
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/80 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Total Demand Price
                </span>
                <div className="text-2xl font-black text-amber-400 font-[Outfit]">
                  PKR {activePlot.pricePKR.toLocaleString('en-PK')}
                </div>
                <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-700/60">
                  <span>Rate per Marla:</span>
                  <span className="font-bold text-white font-mono">
                    PKR {Math.round(activePlot.pricePKR / activePlot.sizeMarla).toLocaleString('en-PK')}
                  </span>
                </div>
              </div>

              {/* Specification Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 text-[10px] block font-semibold">Area Size</span>
                  <span className="font-bold text-white text-sm">
                    {activePlot.sizeMarla} Marla
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    ({activePlot.sizeSqFt || activePlot.sizeMarla * 225} Sq. Ft)
                  </span>
                </div>

                <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 text-[10px] block font-semibold">Demarcation Dim.</span>
                  <span className="font-bold text-white text-sm">
                    {activePlot.dimensions || '25 x 45'}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {activePlot.category === 'commercial' ? 'Commercial Plaza' : 'Residential'}
                  </span>
                </div>

                <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 text-[10px] block font-semibold">Down Payment (20%)</span>
                  <span className="font-bold text-emerald-400 text-xs">
                    PKR {(activePlot.downPaymentPKR || Math.round(activePlot.pricePKR * 0.20)).toLocaleString('en-PK')}
                  </span>
                </div>

                <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                  <span className="text-slate-400 text-[10px] block font-semibold">Monthly Installment</span>
                  <span className="font-bold text-amber-300 text-xs">
                    PKR {(activePlot.monthlyInstallmentPKR || Math.round((activePlot.pricePKR * 0.80) / (activePlot.installmentMonths || 36))).toLocaleString('en-PK')}/mo
                  </span>
                </div>
              </div>

              {/* Features Pill list */}
              {activePlot.features && activePlot.features.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Plot Attributes & Proximity
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activePlot.features.map((f, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-800 text-slate-300 text-[11px] px-2.5 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{f}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Single-Broker Exclusivity badge */}
              {activePlot.dealerName && (
                <div className="bg-teal-950/60 border border-teal-800/60 p-2.5 rounded-xl text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-teal-400 font-bold block">Assigned Exclusive Dealer</span>
                    <span className="text-white font-semibold">{activePlot.dealerName}</span>
                  </div>
                </div>
              )}

            </div>

            {/* Actions: Compare & Book */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              
              {/* Compare Button */}
              {onToggleCompare && (
                <button
                  id={`btn-compare-plot-${activePlot.id}`}
                  onClick={() => onToggleCompare(activePlot)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    comparedPlotIds.includes(activePlot.id)
                      ? 'bg-sky-600 hover:bg-sky-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Scale className="w-4 h-4" />
                  <span>
                    {comparedPlotIds.includes(activePlot.id)
                      ? 'Remove from Plot Comparison'
                      : 'Add to Plot Comparison (Max 3)'}
                  </span>
                </button>
              )}

              {/* Book Plot Button */}
              {activePlot.status === 'available' && !activePlot.isDisputed && (
                <button
                  id={`btn-book-plot-${activePlot.id}`}
                  onClick={() => onBookPlot && onBookPlot(activePlot)}
                  className="w-full py-3 px-4 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Start Official Booking Flow</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {activePlot.status !== 'available' && (
                <div className="p-2.5 rounded-xl bg-slate-800/80 text-center text-xs text-slate-400 font-semibold">
                  This plot is currently {activePlot.status}. Direct online reservations are closed.
                </div>
              )}

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
