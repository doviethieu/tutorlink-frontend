import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Heart, 
  MapPin, 
  Star, 
  Video, 
  X,
  CheckCircle2
} from 'lucide-react';

// =========================================================
// IMPORT THEO ĐÚNG TÊN FILE VIẾT HOA SẾP VỪA ĐỔI
// =========================================================
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// --- CÁC HÀM FORMAT HỖ TRỢ ---
const formatVnd = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
};

const shortDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

const formatLabel = (value) => {
  if (value === 'online') return 'Online';
  if (value === 'offline') return 'Trực tiếp';
  return 'Linh hoạt';
};

const cn = (...classes) => classes.filter(Boolean).join(' ');

// =========================================================
// COMPONENT CHÍNH: THỂ GIA SƯ (TUTOR CARD)
// =========================================================
export function TutorCard({ tutor, favorite = false }) {
  const [liked, setLiked] = useState(favorite);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  return (
    <Card className="overflow-hidden p-5 transition hover:shadow-md">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 gap-4">
          {/* Avatar hoạt hình tự render theo tên */}
          <Avatar name={tutor?.name} size="lg" className="shrink-0" />
          
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={`/tutors/${tutor?.id}`}
                    className="font-semibold text-gray-900 dark:text-gray-100 transition hover:text-[#C05A3E]"
                  >
                    {tutor?.name}
                  </a>
                  {tutor?.verified && (
                    <Badge tone="success">
                      <CheckCircle2 className="h-3 w-3" />
                      Đã xác thực
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">{tutor?.title}</p>
              </div>
              
              <button
                type="button"
                onClick={() => setLiked(!liked)}
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition border-gray-200 dark:border-gray-800',
                  liked
                    ? 'border-red-200 bg-red-50 text-red-500 dark:bg-red-950/30 dark:border-red-900'
                    : 'text-gray-400 hover:border-gray-300 hover:text-gray-600 dark:hover:text-gray-300',
                )}
                aria-label="Yêu thích"
              >
                <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
              </button>
            </div>
            
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
              {tutor?.bio}
            </p>
            
            <div className="mt-3 flex flex-wrap gap-2">
              {tutor?.subjects?.map((subject) => (
                <Badge key={subject} tone="neutral">
                  {subject}
                </Badge>
              ))}
            </div>
            
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-[#FBBF24] text-[#FBBF24]" />
                <b className="font-semibold text-gray-900 dark:text-gray-100">{tutor?.rating}</b> ({tutor?.reviews})
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {tutor?.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Video className="h-4 w-4" />
                {formatLabel(tutor?.format)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {tutor?.sessions} buổi
              </span>
            </div>
          </div>
        </div>

        {/* Khung học phí & nút bấm mở lịch bên phải */}
        <div className="w-full rounded-lg border border-gray-200 bg-gray-50/50 p-4 lg:w-56 dark:border-gray-800 dark:bg-gray-900/40">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Học phí từ</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
            {formatVnd(tutor?.price)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">mỗi giờ · phản hồi {tutor?.responseTime}</p>
          
          <Button 
            variant="default"
            className="mt-4 w-full"
            onClick={() => setScheduleOpen(true)}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Xem lịch
          </Button>
        </div>
      </div>
      
      {scheduleOpen && <ScheduleDialog tutor={tutor} onClose={() => setScheduleOpen(false)} />}
    </Card>
  );
}

// =========================================================
// COMPONENT POP-UP LỊCH HỌC (SCHEDULE DIALOG)
// =========================================================
function ScheduleDialog({ tutor, onClose }) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const normalizedDays = buildFallbackDays(weekOffset);
  const selectedDay = normalizedDays.find((day) => day.date === selectedDate) ?? normalizedDays[0];
  
  const openSlots = selectedDay?.slots?.filter((slot) => slot.status !== 'booked') ?? [];
  const activeDate = selectedDate ?? selectedDay?.date ?? '';
  const activeSlot = selectedSlot ?? openSlots[0]?.start;

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/55 px-4 py-6" onMouseDown={onClose}>
      <Card className="w-full max-w-2xl bg-white shadow-xl dark:bg-gray-950 p-0" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 dark:border-gray-800 p-5">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={tutor?.name} size="md" />
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Đặt buổi học thử</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Với {tutor?.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-900 dark:hover:text-gray-300"
            aria-label="Đóng"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 border-b border-gray-200 dark:border-gray-800 p-4">
          <Button variant="outline" className="h-11 font-bold border-gray-900 shadow-sm dark:border-gray-100">25 phút</Button>
          <Button variant="secondary" className="h-11 font-bold text-gray-500">50 phút</Button>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-800 p-5">
          <div className="mb-4 flex items-center justify-between">
            <button 
              type="button" 
              onClick={() => {
                setWeekOffset(prev => prev - 1);
                setSelectedDate(null);
                setSelectedSlot(null);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-gray-900"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-base font-bold text-gray-900 dark:text-gray-100">{weekLabel(normalizedDays)}</p>
            <button 
              type="button" 
              onClick={() => {
                setWeekOffset(prev => prev + 1);
                setSelectedDate(null);
                setSelectedSlot(null);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-gray-900"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {normalizedDays.slice(0, 7).map((day) => {
              const active = activeDate === day.date;
              return (
                <button
                  key={`${day.date}-${day.day}`}
                  type="button"
                  onClick={() => {
                    setSelectedDate(day.date);
                    setSelectedSlot(null);
                  }}
                  className={cn(
                    'flex h-16 flex-col items-center justify-center rounded-lg text-xs transition border border-transparent',
                    active ? 'border-blue-600 bg-blue-50 font-bold text-[#C05A3E] dark:bg-blue-950/40 dark:text-[#C05A3E]' : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900'
                  )}
                >
                  <span>{dayName(day.date)}</span>
                  <span className="mt-1 text-sm font-bold">{dateNumber(day.date)}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="max-h-[350px] overflow-y-auto p-5">
          <p className="mb-3 text-xs text-gray-400">Theo múi giờ của bạn, Asia/Ho_Chi_Minh (GMT +7:00)</p>
          {openSlots.length === 0 ? (
            <p className="rounded-lg bg-gray-100 p-4 text-sm text-gray-500 dark:bg-gray-900 dark:text-gray-400">Ngày này chưa có khung giờ trống.</p>
          ) : (
            <div className="space-y-6">
              <SlotGroup
                title="Buổi sáng"
                slots={openSlots.filter((slot) => Number(slot.start.slice(0, 2)) < 12)}
                activeSlot={activeSlot}
                onPick={setSelectedSlot}
              />
              <SlotGroup
                title="Buổi chiều"
                slots={openSlots.filter((slot) => {
                  const hour = Number(slot.start.slice(0, 2));
                  return hour >= 12 && hour < 17;
                })}
                activeSlot={activeSlot}
                onPick={setSelectedSlot}
              />
              <SlotGroup
                title="Buổi tối"
                slots={openSlots.filter((slot) => Number(slot.start.slice(0, 2)) >= 17)}
                activeSlot={activeSlot}
                onPick={setSelectedSlot}
              />
            </div>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 p-5">
          {activeDate && activeSlot ? (
            <Button asChild className="w-full">
              <a href={`/tutors/${tutor?.id}/book?date=${activeDate}&slot=${activeSlot}`}>
                Tiếp tục
              </a>
            </Button>
          ) : (
            <Button className="w-full" disabled>
              Tiếp tục
            </Button>
          )}
        </div>
      </Card>
    </div>,
    document.body,
  );
}

function SlotGroup({ title, slots, activeSlot, onPick }) {
  if (slots.length === 0) return null;
  return (
    <div>
      <p className="mb-2 flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100">
        <Clock className="h-4 w-4 text-gray-400" />
        {title}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {slots.map((slot) => (
          <button
            key={slot.start}
            type="button"
            onClick={() => onPick(slot.start)}
            className={cn(
              'h-11 rounded-lg border text-sm font-semibold transition',
              activeSlot === slot.start
                ? 'border-gray-900 bg-white text-gray-900 shadow-[inset_0_0_0_1px_rgba(0,0,0,1)] dark:border-gray-100 dark:bg-gray-950 dark:text-gray-100 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,1)]'
                : 'border-gray-200 bg-white text-gray-900 hover:border-blue-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100'
            )}
          >
            {slot.start}
          </button>
        ))}
      </div>
    </div>
  );
}

function buildFallbackDays(weekOffset) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + weekOffset * 7);
    return {
      date: date.toISOString().slice(0, 10),
      day: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
      slots: [
        { start: '08:30', status: 'open' },
        { start: '10:00', status: 'open' },
        { start: '14:15', status: 'open' },
        { start: '16:00', status: 'open' },
        { start: '19:30', status: 'open' },
        { start: '21:00', status: 'open' },
      ],
    };
  });
}

function weekLabel(days) {
  const first = days[0]?.date;
  const last = days[Math.min(days.length, 7) - 1]?.date;
  if (!first || !last) return 'Lịch tuần này';
  return `${shortDate(first)} - ${shortDate(last)}`;
}

function dayName(dateStr) {
  return new Date(dateStr).toLocaleDateString('vi-VN', { weekday: 'short' }).replace('Th ', 'T');
}

function dateNumber(dateStr) {
  return String(new Date(dateStr).getDate()).padStart(2, '0');
}
