import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-4 text-center">
      <p className="text-6xl font-extrabold text-brand-800">404</p>
      <p className="text-brand-600">هذه الصفحة غير موجودة.</p>
      <Link to="/">
        <Button>العودة إلى الصفحة الرئيسية</Button>
      </Link>
    </div>
  );
}
