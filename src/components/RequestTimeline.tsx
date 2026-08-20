import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import type { CustodyRequest } from '../features/custody';

export function RequestTimeline({ request }: { request: CustodyRequest }) {
  const isRejected = request.status === 'rejected';
  
  const steps = [
    { label: 'إنشاء الطلب', status: 'completed' },
    { label: 'بانتظار الموافقة', status: request.status === 'pending' ? 'current' : 'completed' },
    { 
      label: isRejected ? 'مرفوض' : 'تمت الموافقة', 
      status: isRejected ? 'rejected' : (request.status === 'pending' ? 'upcoming' : 'completed') 
    },
    { 
      label: 'جاري الصرف', 
      status: isRejected ? 'upcoming' : (['approved'].includes(request.status) ? 'current' : (['assigned', 'returned'].includes(request.status) ? 'completed' : 'upcoming')) 
    },
    { 
      label: 'تم التسليم', 
      status: isRejected ? 'upcoming' : (['assigned', 'returned'].includes(request.status) ? 'completed' : 'upcoming') 
    },
    { 
      label: 'تم الإرجاع', 
      status: String(request.status) === 'returned' ? 'completed' : 'upcoming' 
    },
  ];

  return (
    <div className="mt-8 relative">
      <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-border hidden sm:block" />
      <div className="relative flex flex-col gap-4 sm:flex-row justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex sm:flex-col items-center gap-3 sm:gap-2 bg-surface relative z-10 px-2">
            {step.status === 'completed' && <CheckCircle2 className="text-success bg-surface" size={24} />}
            {step.status === 'current' && <Clock className="text-primary bg-surface" size={24} />}
            {step.status === 'upcoming' && <Circle className="text-muted bg-surface" size={24} />}
            {step.status === 'rejected' && <XCircle className="text-danger bg-surface" size={24} />}
            <span className={`text-xs font-semibold ${
              step.status === 'completed' ? 'text-success' :
              step.status === 'current' ? 'text-primary' :
              step.status === 'rejected' ? 'text-danger' :
              'text-muted'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
