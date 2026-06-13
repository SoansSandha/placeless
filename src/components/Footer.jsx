export function Footer() {
  return (
    <footer className="pt-16 pb-8 px-6 max-w-[1200px] mx-auto w-full border-t border-[#e3e8ee]">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
        <div>
          <h2 className="text-[22px] font-light tracking-[-0.22px] text-[#0d253d] mb-1">Placeless</h2>
          <p className="text-[13px] text-[#64748d]">Social deduction for the modern web.</p>
        </div>
        <div className="flex gap-12">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-normal uppercase tracking-wider text-[#0d253d]">Project</span>
            <a href="https://github.com/SoansSandha/placeless" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#64748d] hover:text-[#533afd] transition-colors">
              GitHub
            </a>
            <a href="/license" className="text-[13px] text-[#64748d] hover:text-[#533afd] transition-colors">
              License
            </a>
          </div>
        </div>
      </div>
      <div className="text-[11px] text-[#64748d]">
        © {new Date().getFullYear()} Placeless. Inspired by Spyfall.
      </div>
    </footer>
  );
}
