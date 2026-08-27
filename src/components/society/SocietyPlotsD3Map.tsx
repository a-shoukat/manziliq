import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Plot, Society } from '../../types';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Sparkles, 
  Maximize2, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  MapPin, 
  Building2, 
  SlidersHorizontal,
  Compass
} from 'lucide-react';

interface SocietyPlotsD3MapProps {
  society: Society;
  plots: Plot[];
  selectedPlot: Plot | null;
  onSelectPlot: (plot: Plot) => void;
  onBookPlot?: (plot: Plot) => void;
}

type VisualizationMode = 'status' | 'price' | 'size';

export const SocietyPlotsD3Map: React.FC<SocietyPlotsD3MapProps> = ({
  society,
  plots = [],
  selectedPlot,
  onSelectPlot,
  onBookPlot
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const [visMode, setVisMode] = useState<VisualizationMode>('status');
  const [activeSectorFilter, setActiveSectorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hoveredPlot, setHoveredPlot] = useState<Plot | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 800, height: 520 });

  // Extract unique sectors from plots
  const sectors = useMemo(() => {
    const sSet = new Set<string>();
    plots.forEach(p => {
      if (p.sector) sSet.add(p.sector);
    });
    return Array.from(sSet);
  }, [plots]);

  // Ensure every plot has valid numeric coordinates (x, y)
  const normalizedPlots = useMemo(() => {
    return plots.map((p, idx) => {
      let x = p.coordinates?.x;
      let y = p.coordinates?.y;
      if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) {
        // Fallback coordinate generation for grid placement
        x = (idx % 5) + 1;
        y = Math.floor(idx / 5) + 1;
      }
      return {
        ...p,
        coordinates: { x, y }
      };
    });
  }, [plots]);

  // Count summaries
  const statusCounts = useMemo(() => {
    const avail = normalizedPlots.filter(p => p.status === 'available').length;
    const res = normalizedPlots.filter(p => p.status === 'reserved').length;
    const sold = normalizedPlots.filter(p => p.status === 'sold').length;
    const disputed = normalizedPlots.filter(p => p.isDisputed).length;
    const commercial = normalizedPlots.filter(p => p.category === 'commercial').length;
    return { avail, res, sold, disputed, commercial, total: normalizedPlots.length };
  }, [normalizedPlots]);

  // Color helper according to mode
  const getPlotColor = (p: Plot) => {
    if (p.isDisputed) return { fill: '#e11d48', stroke: '#be123c', text: '#ffffff', label: 'Disputed' }; // Rose

    if (visMode === 'status') {
      if (p.category === 'commercial' && p.status === 'available') {
        return { fill: '#7c3aed', stroke: '#6d28d9', text: '#ffffff', label: 'Commercial' }; // Purple
      }
      switch (p.status) {
        case 'available':
          return { fill: '#059669', stroke: '#047857', text: '#ffffff', label: 'Available' }; // Emerald Green
        case 'reserved':
          return { fill: '#ea580c', stroke: '#c2410c', text: '#ffffff', label: 'Reserved' }; // Orange/Red
        case 'sold':
          return { fill: '#475569', stroke: '#334155', text: '#cbd5e1', label: 'Sold' }; // Slate Gray
        default:
          return { fill: '#059669', stroke: '#047857', text: '#ffffff', label: 'Available' };
      }
    } else if (visMode === 'price') {
      // Color intensity based on PKR price
      const minP = 1500000;
      const maxP = 7500000;
      const t = Math.min(1, Math.max(0, (p.pricePKR - minP) / (maxP - minP)));
      const color = d3.interpolateViridis(t);
      return { fill: color, stroke: d3.rgb(color).darker(0.8).formatHex(), text: '#ffffff', label: `PKR ${(p.pricePKR / 100000).toFixed(1)}L` };
    } else {
      // Size scale mode
      if (p.sizeMarla <= 3) return { fill: '#0284c7', stroke: '#0369a1', text: '#ffffff', label: '3 Marla' }; // Sky
      if (p.sizeMarla <= 5) return { fill: '#059669', stroke: '#047857', text: '#ffffff', label: '5 Marla' }; // Emerald
      if (p.sizeMarla <= 7) return { fill: '#d97706', stroke: '#b45309', text: '#ffffff', label: '7 Marla' }; // Amber
      if (p.sizeMarla <= 10) return { fill: '#7c3aed', stroke: '#6d28d9', text: '#ffffff', label: '10 Marla' }; // Purple
      return { fill: '#dc2626', stroke: '#b91c1c', text: '#ffffff', label: '1 Kanal+' }; // Red
    }
  };

  // ResizeObserver for responsive width/height
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          const height = Math.max(480, Math.min(600, width * 0.65));
          setDimensions({ width, height });
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Main D3 Rendering Effect
  useEffect(() => {
    if (!svgRef.current || normalizedPlots.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 70, right: 60, bottom: 80, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create defs (gradients, filters, patterns)
    const defs = svg.append('defs');

    // Grid pattern
    const pattern = defs.append('pattern')
      .attr('id', 'masterplan-grid')
      .attr('width', 30)
      .attr('height', 30)
      .attr('patternUnits', 'userSpaceOnUse');

    pattern.append('path')
      .attr('d', 'M 30 0 L 0 0 0 30')
      .attr('fill', 'none')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', '1')
      .attr('stroke-opacity', '0.4');

    // Glow filter for selected plot
    const filter = defs.append('filter')
      .attr('id', 'plot-glow')
      .attr('x', '-30%')
      .attr('y', '-30%')
      .attr('width', '160%')
      .attr('height', '160%');

    filter.append('feGaussianBlur')
      .attr('stdDeviation', '4')
      .attr('result', 'blur');
    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');

    // Main Zoomable Group
    const g = svg.append('g').attr('class', 'masterplan-viewport');

    // Background Canvas Rect with Grid
    g.append('rect')
      .attr('x', -200)
      .attr('y', -200)
      .attr('width', width + 400)
      .attr('height', height + 400)
      .attr('fill', '#0b1120');

    g.append('rect')
      .attr('x', -200)
      .attr('y', -200)
      .attr('width', width + 400)
      .attr('height', height + 400)
      .attr('fill', 'url(#masterplan-grid)');

    // Compute coordinate domains
    const xExtent = d3.extent(normalizedPlots, (p: Plot) => p.coordinates.x);
    const yExtent = d3.extent(normalizedPlots, (p: Plot) => p.coordinates.y);

    const minX = Math.min(1, xExtent[0] ?? 1);
    const maxX = Math.max(5, xExtent[1] ?? 5);
    const minY = Math.min(1, yExtent[0] ?? 1);
    const maxY = Math.max(3, yExtent[1] ?? 3);

    // Linear Scales
    const xScale = d3.scaleLinear()
      .domain([minX - 0.5, maxX + 0.5])
      .range([margin.left, margin.left + innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([minY - 0.5, maxY + 0.5])
      .range([margin.top, margin.top + innerHeight]);

    // Plot Dimensions in SVG units
    const plotWidth = Math.min(110, (innerWidth / (maxX - minX + 1.5)) * 0.85);
    const plotHeight = Math.min(90, (innerHeight / (maxY - minY + 1.5)) * 0.78);

    // 1. Draw Masterplan Infrastructure Zones (Roads, Green Belts, Commercial Corridor)
    const infraGroup = g.append('g').attr('class', 'infrastructure-layer');

    // Main 100ft Boulevard Road at Bottom
    const roadY = yScale(maxY + 0.35);
    infraGroup.append('rect')
      .attr('x', margin.left - 40)
      .attr('y', roadY)
      .attr('width', innerWidth + 80)
      .attr('height', 36)
      .attr('rx', 8)
      .attr('fill', '#1e293b')
      .attr('stroke', '#334155')
      .attr('stroke-width', 1.5);

    // Center dash line on boulevard
    infraGroup.append('line')
      .attr('x1', margin.left - 30)
      .attr('y1', roadY + 18)
      .attr('x2', margin.left + innerWidth + 70)
      .attr('y2', roadY + 18)
      .attr('stroke', '#facc15')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '8 6');

    infraGroup.append('text')
      .attr('x', margin.left + innerWidth / 2)
      .attr('y', roadY + 23)
      .attr('text-anchor', 'middle')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-weight', '800')
      .attr('letter-spacing', '2px')
      .text('=== 100 FT MAIN COMMERCIAL BOULEVARD ===');

    // Green Park Area in corner
    const parkX = xScale(maxX + 0.1);
    const parkY = yScale(minY - 0.1);
    infraGroup.append('rect')
      .attr('x', parkX - 10)
      .attr('y', parkY - 10)
      .attr('width', 90)
      .attr('height', 80)
      .attr('rx', 12)
      .attr('fill', '#064e3b')
      .attr('fill-opacity', 0.4)
      .attr('stroke', '#059669')
      .attr('stroke-dasharray', '4 3')
      .attr('stroke-width', 1.5);

    infraGroup.append('text')
      .attr('x', parkX + 35)
      .attr('y', parkY + 35)
      .attr('text-anchor', 'middle')
      .attr('fill', '#34d399')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text('🌳 Sector Park');

    infraGroup.append('text')
      .attr('x', parkX + 35)
      .attr('y', parkY + 50)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6ee7b7')
      .attr('font-size', '9px')
      .text('& Green Belt');

    // Mosque / Community Marker
    const mosqueX = xScale(minX - 0.35);
    const mosqueY = yScale(minY - 0.1);
    infraGroup.append('rect')
      .attr('x', mosqueX - 15)
      .attr('y', mosqueY - 10)
      .attr('width', 80)
      .attr('height', 70)
      .attr('rx', 12)
      .attr('fill', '#312e81')
      .attr('fill-opacity', 0.4)
      .attr('stroke', '#6366f1')
      .attr('stroke-dasharray', '4 3')
      .attr('stroke-width', 1.5);

    infraGroup.append('text')
      .attr('x', mosqueX + 25)
      .attr('y', mosqueY + 32)
      .attr('text-anchor', 'middle')
      .attr('fill', '#a5b4fc')
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .text('🕌 Grand Mosque');

    infraGroup.append('text')
      .attr('x', mosqueX + 25)
      .attr('y', mosqueY + 47)
      .attr('text-anchor', 'middle')
      .attr('fill', '#c7d2fe')
      .attr('font-size', '9px')
      .text('& Plaza');

    // 2. Draw Plots Layer
    const plotsGroup = g.append('g').attr('class', 'plots-layer');

    const plotNodes = plotsGroup.selectAll<SVGGElement, Plot>('.plot-node')
      .data(normalizedPlots, (d: any) => d.id)
      .enter()
      .append('g')
      .attr('class', 'plot-node')
      .attr('transform', (d: Plot) => {
        const cx = xScale(d.coordinates.x) - plotWidth / 2;
        const cy = yScale(d.coordinates.y) - plotHeight / 2;
        return `translate(${cx}, ${cy})`;
      })
      .style('cursor', 'pointer');

    // Plot Background Rectangle
    plotNodes.append('rect')
      .attr('class', 'plot-rect')
      .attr('width', plotWidth)
      .attr('height', plotHeight)
      .attr('rx', 10)
      .attr('fill', (d: Plot) => getPlotColor(d).fill)
      .attr('stroke', (d: Plot) => (selectedPlot?.id === d.id ? '#ffffff' : getPlotColor(d).stroke))
      .attr('stroke-width', (d: Plot) => (selectedPlot?.id === d.id ? 3 : 1.5))
      .attr('opacity', (d: Plot) => {
        const matchesSector = activeSectorFilter === 'all' || d.sector === activeSectorFilter;
        const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
        return matchesSector && matchesStatus ? 1 : 0.25;
      })
      .style('filter', (d: Plot) => (selectedPlot?.id === d.id ? 'url(#plot-glow)' : 'none'))
      .style('transition', 'all 0.2s ease');

    // Top Category / Size Badge inside Plot
    plotNodes.append('rect')
      .attr('x', 6)
      .attr('y', 6)
      .attr('width', plotWidth - 12)
      .attr('height', 16)
      .attr('rx', 4)
      .attr('fill', 'rgba(15, 23, 42, 0.4)')
      .attr('opacity', (d: Plot) => {
        const matchesSector = activeSectorFilter === 'all' || d.sector === activeSectorFilter;
        const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
        return matchesSector && matchesStatus ? 1 : 0.25;
      });

    // Plot Number Text
    plotNodes.append('text')
      .attr('x', plotWidth / 2)
      .attr('y', 18)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '10px')
      .attr('font-weight', '900')
      .attr('font-family', 'Outfit, sans-serif')
      .attr('letter-spacing', '0.5px')
      .text((d: Plot) => d.plotNumber);

    // Plot Size Marla Text
    plotNodes.append('text')
      .attr('x', plotWidth / 2)
      .attr('y', 42)
      .attr('text-anchor', 'middle')
      .attr('fill', (d: Plot) => getPlotColor(d).text)
      .attr('font-size', '12px')
      .attr('font-weight', '800')
      .attr('font-family', 'Outfit, sans-serif')
      .text((d: Plot) => `${d.sizeMarla} Marla`);

    // Plot Dimensions / Price label
    plotNodes.append('text')
      .attr('x', plotWidth / 2)
      .attr('y', 58)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(255, 255, 255, 0.85)')
      .attr('font-size', '9px')
      .attr('font-family', 'monospace')
      .attr('font-weight', 'bold')
      .text((d: Plot) => `PKR ${(d.pricePKR / 100000).toFixed(0)}L`);

    // Bottom Status Strip
    plotNodes.append('text')
      .attr('x', plotWidth / 2)
      .attr('y', 74)
      .attr('text-anchor', 'middle')
      .attr('fill', 'rgba(255, 255, 255, 0.95)')
      .attr('font-size', '8px')
      .attr('font-weight', '900')
      .attr('letter-spacing', '0.8px')
      .text((d: Plot) => (d.isDisputed ? '⚠️ DISPUTE' : d.status.toUpperCase()));

    // Interactive Hover & Click Listeners
    plotNodes
      .on('mouseenter', function (event: MouseEvent, d: Plot) {
        d3.select(this).select('.plot-rect')
          .transition()
          .duration(150)
          .attr('transform', 'scale(1.06)')
          .attr('transform-origin', `${plotWidth / 2} ${plotHeight / 2}`)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2.5);

        const [mX, mY] = d3.pointer(event, containerRef.current);
        setHoveredPlot(d);
        setTooltipPos({ x: mX, y: mY });
      })
      .on('mousemove', function (event: MouseEvent) {
        const [mX, mY] = d3.pointer(event, containerRef.current);
        setTooltipPos({ x: mX, y: mY });
      })
      .on('mouseleave', function (this: SVGGElement, event: MouseEvent, d: Plot) {
        d3.select(this).select('.plot-rect')
          .transition()
          .duration(150)
          .attr('transform', 'scale(1)')
          .attr('stroke', selectedPlot?.id === d.id ? '#ffffff' : getPlotColor(d).stroke)
          .attr('stroke-width', selectedPlot?.id === d.id ? 3 : 1.5);

        setHoveredPlot(null);
        setTooltipPos(null);
      })
      .on('click', function (event: MouseEvent, d: Plot) {
        event.stopPropagation();
        onSelectPlot(d);
      });

    // 3. D3 Zoom and Pan Setup
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.65, 3.2])
      .on('zoom', event => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomBehaviorRef.current = zoom;

    // Initial Zoom Center
    svg.transition().duration(500).call(
      zoom.transform,
      d3.zoomIdentity.translate(0, 0).scale(1)
    );

  }, [dimensions, normalizedPlots, visMode, activeSectorFilter, statusFilter, selectedPlot]);

  // Zoom control handlers
  const handleZoomIn = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.scaleBy, 1.25);
  };

  const handleZoomOut = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(300)
      .call(zoomBehaviorRef.current.scaleBy, 0.8);
  };

  const handleResetZoom = () => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(400)
      .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(0, 0).scale(1));
  };

  return (
    <div className="space-y-4">
      
      {/* Top Map Controller Toolbar */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-4">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Header & Coordinates Indicator */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <h3 className="text-base font-extrabold text-white font-[Outfit] flex items-center gap-2">
                <span>D3 Masterplan & Demarcation Grid</span>
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                  Interactive X,Y Coordinates
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Hover & click plot nodes to inspect dimensions, pricing, and reservation status.
            </p>
          </div>

          {/* Visualization Modes & Zoom Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            
            {/* Vis Mode Selector */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setVisMode('status')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  visMode === 'status' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Status color-coding (Green=Available, Orange=Reserved, Slate=Sold)"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Status View</span>
              </button>

              <button
                onClick={() => setVisMode('price')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  visMode === 'price' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Color intensity based on PKR price"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Price Heatmap</span>
              </button>

              <button
                onClick={() => setVisMode('size')}
                className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  visMode === 'size' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Color scale by Marla size"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Marla Size</span>
              </button>
            </div>

            {/* Zoom Action Buttons */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition cursor-pointer"
                title="Reset View"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Sector & Status Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          
          {/* Sector Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Sector:</span>
            <button
              onClick={() => setActiveSectorFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                activeSectorFilter === 'all' ? 'bg-white text-slate-950 shadow-xs' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Sectors
            </button>
            {sectors.map(sec => (
              <button
                key={sec}
                onClick={() => setActiveSectorFilter(sec)}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  activeSectorFilter === sec ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Live Status Legend with Counts */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setStatusFilter(statusFilter === 'available' ? 'all' : 'available')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                statusFilter === 'available' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500' : 'text-slate-300'
              }`}
            >
              <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block shadow-2xs" />
              <span className="font-bold">Available ({statusCounts.avail})</span>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'reserved' ? 'all' : 'reserved')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                statusFilter === 'reserved' ? 'bg-orange-500/30 text-orange-300 border border-orange-500' : 'text-slate-300'
              }`}
            >
              <span className="w-3 h-3 rounded-md bg-orange-600 inline-block shadow-2xs" />
              <span className="font-bold">Reserved ({statusCounts.res})</span>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'sold' ? 'all' : 'sold')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                statusFilter === 'sold' ? 'bg-slate-600/30 text-slate-300 border border-slate-600' : 'text-slate-400'
              }`}
            >
              <span className="w-3 h-3 rounded-md bg-slate-600 inline-block shadow-2xs" />
              <span className="font-bold">Sold ({statusCounts.sold})</span>
            </button>

            {statusCounts.commercial > 0 && (
              <span className="flex items-center gap-1.5 text-purple-300">
                <span className="w-3 h-3 rounded-md bg-purple-600 inline-block shadow-2xs" />
                <span className="font-bold">Commercial ({statusCounts.commercial})</span>
              </span>
            )}
          </div>

        </div>

      </div>

      {/* D3 Canvas Viewport Container */}
      <div 
        ref={containerRef}
        className="relative w-full rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none"
        style={{ minHeight: '480px' }}
      >
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full block cursor-grab active:cursor-grabbing"
        />

        {/* Compass & Scale Indicator Overlay */}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-xs p-2.5 rounded-2xl border border-slate-700/60 text-white flex items-center gap-2 pointer-events-none shadow-md">
          <Compass className="w-5 h-5 text-emerald-400 animate-spin-slow" />
          <div className="text-[10px] leading-tight">
            <div className="font-black tracking-wider text-slate-200">NORTH ORIENTED</div>
            <div className="text-slate-400 font-mono">TMA Approved Grid</div>
          </div>
        </div>

        {/* Dynamic D3 Hover Tooltip */}
        {hoveredPlot && tooltipPos && (
          <div
            className="absolute z-30 pointer-events-none bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-slate-700 shadow-2xl space-y-1.5 animate-scale-up"
            style={{
              left: Math.min(dimensions.width - 240, Math.max(10, tooltipPos.x + 15)),
              top: Math.min(dimensions.height - 180, Math.max(10, tooltipPos.y - 80)),
              width: '230px'
            }}
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
              <span className="font-black text-sm font-[Outfit] text-white">
                Plot {hoveredPlot.plotNumber}
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                hoveredPlot.status === 'available' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                hoveredPlot.status === 'reserved' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40' :
                'bg-slate-700 text-slate-300'
              }`}>
                {hoveredPlot.status}
              </span>
            </div>

            <div className="space-y-1 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Sector / Block:</span>
                <span className="font-bold text-white">{hoveredPlot.sector} ({hoveredPlot.block || 'Executive'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dimensions:</span>
                <span className="font-mono text-slate-200">{hoveredPlot.dimensions || '25x45'} ({hoveredPlot.sizeMarla} Marla)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Demand:</span>
                <span className="font-mono font-black text-emerald-400">PKR {hoveredPlot.pricePKR.toLocaleString('en-PK')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Coordinates:</span>
                <span className="font-mono text-amber-300">X: {hoveredPlot.coordinates.x}, Y: {hoveredPlot.coordinates.y}</span>
              </div>
            </div>

            {hoveredPlot.isDisputed && (
              <div className="p-1.5 bg-rose-500/20 border border-rose-500/40 rounded-lg text-[10px] text-rose-300 flex items-center gap-1 font-bold">
                <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                <span>Title Dispute Under Mediation</span>
              </div>
            )}

            <div className="text-[9px] text-slate-400 pt-1 text-center font-semibold">
              Click node to view full details & book
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
