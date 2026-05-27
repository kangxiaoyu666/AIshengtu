export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white/50 backdrop-blur">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-5 max-xl:flex-col max-xl:gap-3">
        <p className="text-xs text-slate-400">© 2026 造境 AI · All Rights Reserved.</p>
        <div className="flex items-center gap-6 text-xs text-slate-400">
          <a href="#" className="hover:text-blue-500 transition-colors">常见问题</a>
          <a href="#" className="hover:text-blue-500 transition-colors">关于我们</a>
          <a href="#" className="hover:text-blue-500 transition-colors">用户协议</a>
          <a href="#" className="hover:text-blue-500 transition-colors">隐私政策</a>
        </div>
      </div>
    </footer>
  );
}
