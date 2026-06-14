// App version shown in the footer. package.json is the single source of truth —
// bump its "version" on a release and the footer reflects it after deploy.
import { version } from '../../package.json';

export function Footer() {
  return (
    <footer className="pt-16 pb-8 px-6 max-w-[1200px] mx-auto w-full border-t border-[#e3e8ee] dark:border-[#2a2d5c]">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
        <div>
          <h2 className="text-[22px] font-light tracking-[-0.22px] text-[#0d253d] dark:text-[#eef1fb] mb-1">Placeless</h2>
          <p className="text-[13px] text-[#64748d] dark:text-[#8b95b8]">Social deduction for the modern web.</p>
        </div>
        <div className="flex gap-12">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-normal uppercase tracking-wider text-[#0d253d] dark:text-[#eef1fb]">Project</span>
            <a href="https://github.com/SoansSandha/placeless" target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#64748d] dark:text-[#8b95b8] hover:text-[#533afd] dark:hover:text-[#b9b9f9] transition-colors">
              GitHub
            </a>
            <span className="text-[13px] text-[#64748d] dark:text-[#8b95b8]">
              v{version}
            </span>
          </div>
        </div>
      </div>
      <div className="text-[11px] text-[#64748d] dark:text-[#8b95b8]">
        © {new Date().getFullYear()} Placeless. Inspired by Spyfall.
      </div>
    </footer>
  );
}
