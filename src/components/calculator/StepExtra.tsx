'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { formatPhone, isPhoneValid } from '@/lib/phone'
import {
  Info, AlertTriangle,
  GraduationCap, RefreshCw, KeyRound, ClipboardCheck,
  RotateCcw, Download, ArrowLeft, CheckCheck,
  Send, Clock, ChevronDown, ChevronUp, Shield
} from 'lucide-react'
import { step3Services } from '@/config/services-step3'
import { getProductCardPrice, getProductCardPriceLabel } from '@/config/product-cards'
import { scannerPrices } from '@/config/services'
import type { KkmType, KkmCondition, ClientData, HintButtonProps, TotalCalc } from './types'
import { HintButton } from './HintButton'

interface StepExtraProps {
  kkmType: KkmType
  kkmCondition: KkmCondition
  effectiveKkm: KkmType
  step3Selections: string[]
  scannerChecked: boolean
  fnChecked: boolean
  productCardCount: number
  trainingHours: number
  serviceContractChecked: boolean
  serviceContractPeriod: 'month' | 'year'
  evotorRestore: boolean
  fnPeriod: string
  fnActivityType: string
  clientData: ClientData
  totalCalc: TotalCalc
  // Setters
  setStep3Selections: (v: string[] | ((prev: string[]) => string[])) => void
  setScannerChecked: (v: boolean) => void
  setFnChecked: (v: boolean) => void
  setFnPeriod: (v: string) => void
  setFnActivityType: (v: string) => void
  setProductCardCount: (v: number) => void
  setTrainingHours: (v: number) => void
  setServiceContractChecked: (v: boolean) => void
  setServiceContractPeriod: (v: 'month' | 'year') => void
  setEvotorRestore: (v: boolean) => void
  setClientData: (v: ClientData | ((prev: ClientData) => ClientData)) => void
  hintProps: HintButtonProps
  setCurrentStep: (v: number) => void
  mainRef: React.RefObject<HTMLDivElement | null>
  setIsDone: (v: boolean) => void
  handleReset: () => void
  handleDone: () => void
}

export function StepExtra({
  kkmType, kkmCondition, effectiveKkm,
  step3Selections, scannerChecked, fnChecked, productCardCount, trainingHours,
  serviceContractChecked, serviceContractPeriod, evotorRestore,
  fnPeriod, fnActivityType, clientData, totalCalc,
  setStep3Selections, setScannerChecked, setFnChecked, setFnPeriod, setFnActivityType,
  setProductCardCount, setTrainingHours, setServiceContractChecked, setServiceContractPeriod,
  setEvotorRestore, setClientData,
  hintProps, setCurrentStep, mainRef, setIsDone,
  handleReset, handleDone
}: StepExtraProps) {
  const [showDetails, setShowDetails] = useState(false)
  const canSubmit = clientData.name.trim() !== '' && isPhoneValid(clientData.phone)
  return (
    <div className="max-w-3xl mx-auto space-y-2">

        <div className="flex gap-4">
          <Button variant="outline" className="flex-1 py-4 text-base font-bold" size="lg" onClick={() => { setCurrentStep(2); setTimeout(() => mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50) }}><ArrowLeft className="w-5 h-5 mr-2" /> Назад</Button>
        </div>

        {/* ПРОДАЮЩАЯ ФОРМА ЗАЯВКИ */}
        <Card id="lead-form-section" className="border-[#163A5F]/20 overflow-hidden">
          {/* Верхняя акцентная полоска */}
          <div className="bg-gradient-to-r from-[#163A5F] to-[#1E4A78] px-4 sm:px-5 py-4 sm:py-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                <Send className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-white font-extrabold text-base sm:text-lg leading-tight">Оставьте заявку — получите расчёт</h3>
                <p className="text-white/70 text-xs sm:text-sm mt-1">Менеджер перезвонит в течение <span className="text-[#F59E0B] font-semibold">15 минут</span> и подготовит точную смету</p>
              </div>
            </div>
          </div>

          <CardContent className="p-4 sm:p-5 space-y-4">
            {/* Основные поля — всегда видны */}
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Как к вам обращаться? <span className="text-red-500">*</span></Label>
                <Input value={clientData.name} onChange={(e) => setClientData({ ...clientData, name: e.target.value })} placeholder="ИП Иванов или ООО «Ромашка»" className="mt-1.5 text-sm h-11" autoComplete="name" />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">Телефон <span className="text-red-500">*</span></Label>
                <Input type="tel" value={clientData.phone} onChange={(e) => setClientData({ ...clientData, phone: formatPhone(e.target.value) })} placeholder="+7 (___) ___-__-__" className="mt-1.5 text-sm h-11" maxLength={18} autoComplete="tel" inputMode="tel" />
                {!isPhoneValid(clientData.phone) && clientData.phone.length > 0 && <p className="text-[11px] text-red-500 mt-1">Введите полный номер: +7 (XXX) XXX-XX-XX</p>}
              </div>
            </div>

            {/* Раскрывающийся блок доп. сведений */}
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-slate-200 hover:border-[#163A5F]/30 hover:bg-[#163A5F]/[0.02] transition-all text-left group"
            >
              <span className="text-xs sm:text-sm font-medium text-slate-600 group-hover:text-[#163A5F] transition-colors">
                Дополнительные сведения
                {!showDetails && <span className="text-slate-400 font-normal ml-1 hidden sm:inline">— ИНН, адрес, модель кассы</span>}
              </span>
              {showDetails
                ? <ChevronUp className="w-4 h-4 text-slate-400" />
                : <ChevronDown className="w-4 h-4 text-slate-400" />
              }
            </button>

            {showDetails && (
              <div className="space-y-3 animate-fade-in-up border-l-2 border-[#163A5F]/10 pl-3.5 ml-1">
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <div>
                    <Label className="text-xs">ИНН <span className="text-slate-400 font-normal">(если знаете)</span></Label>
                    <Input value={clientData.inn} onChange={(e) => setClientData({ ...clientData, inn: e.target.value })} placeholder="0000000000" className="mt-1 text-sm h-10" autoComplete="off" />
                  </div>
                  <div>
                    <Label className="text-xs">Электронная почта</Label>
                    <Input type="email" value={clientData.email} onChange={(e) => setClientData({ ...clientData, email: e.target.value })} placeholder="mail@company.ru" className="mt-1 text-sm h-10" autoComplete="email" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Адрес установки кассы</Label>
                  <Input list="ru-addresses" value={clientData.address} onChange={(e) => setClientData({ ...clientData, address: e.target.value })} className="mt-1 text-sm h-10" autoComplete="street-address" />
                  <datalist id="ru-addresses">
                    <option value="г. Санкт-Петербург" /><option value="г. Москва" /><option value="г. Новосибирск" /><option value="г. Екатеринбург" /><option value="г. Казань" /><option value="г. Нижний Новгород" /><option value="г. Челябинск" /><option value="г. Самара" /><option value="г. Омск" /><option value="г. Ростов-на-Дону" /><option value="г. Уфа" /><option value="г. Красноярск" /><option value="г. Воронеж" /><option value="г. Пермь" /><option value="г. Волгоград" /><option value="г. Краснодар" /><option value="г. Саратов" /><option value="г. Тюмень" /><option value="г. Тольятти" /><option value="г. Ижевск" />
                  </datalist>
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  <div>
                    <Label className="text-xs">Модель кассы <span className="text-slate-400 font-normal">(на кассе и в чеке)</span></Label>
                    <Input value={clientData.kkmModel} onChange={(e) => setClientData({ ...clientData, kkmModel: e.target.value })} className="mt-1 text-sm h-10" autoComplete="off" />
                  </div>
                  <div>
                    <Label className="text-xs">Заводской номер</Label>
                    <Input value={clientData.kkmNumber} onChange={(e) => setClientData({ ...clientData, kkmNumber: e.target.value })} className="mt-1 text-sm h-10" autoComplete="off" />
                  </div>
                </div>
                {kkmType === 'evotor' && (
                  <div className="p-2.5 bg-[#163A5F]/5 rounded-lg space-y-2">
                    <p className="text-xs text-[#163A5F] font-medium flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />Данные от ЛК Эвотор
                    </p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Логин (телефон)</Label>
                        <Input type="tel" value={clientData.evotorLogin} onChange={(e) => setClientData({ ...clientData, evotorLogin: e.target.value })} className="mt-1 text-sm" autoComplete="tel" inputMode="tel" />
                      </div>
                      <div>
                        <Label className="text-xs">Пароль</Label>
                        <Input type="password" value={clientData.evotorPassword} onChange={(e) => setClientData({ ...clientData, evotorPassword: e.target.value })} className="mt-1 text-sm" autoComplete="current-password" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded">
                      <Checkbox id="evotor_restore_r" checked={evotorRestore} onCheckedChange={(c) => setEvotorRestore(c as boolean)} className="w-5 h-5 shrink-0" />
                      <Label htmlFor="evotor_restore_r" className="cursor-pointer text-xs text-[#163A5F]">Нет данных ЛК — помощь с восстановлением <span className="font-semibold">500 руб.</span></Label>
                    </div>
                  </div>
                )}
                <div>
                  <Label className="text-xs">Примечания</Label>
                  <Input value={clientData.comment} onChange={(e) => setClientData({ ...clientData, comment: e.target.value })} placeholder="Дополнительная информация" className="mt-1 text-sm h-10" autoComplete="off" />
                </div>
              </div>
            )}

            {/* Траст-блок: время ответа + конфиденциальность */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-[#163A5F] shrink-0" />
                <span>Ответ в течение <strong className="text-slate-700">15 минут</strong> в рабочее время</span>
              </div>
              <div className="hidden sm:block w-px bg-slate-200" />
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Shield className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span>Данные защищены по <strong className="text-slate-700">152-ФЗ</strong></span>
              </div>
            </div>
          </CardContent>

          {/* CTA кнопка с ценой */}
          <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
            {/* Галочка ЭЦП перед отправкой */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${clientData.hasEcp ? 'bg-green-50 border-green-300' : 'bg-amber-50 border-amber-200 hover:border-amber-300'}`}
              onClick={() => setClientData(prev => ({ ...prev, hasEcp: !prev.hasEcp }))}
              role="checkbox"
              aria-checked={clientData.hasEcp}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setClientData(prev => ({ ...prev, hasEcp: !prev.hasEcp })) } }}
            >
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${clientData.hasEcp ? 'bg-green-500 border-green-500' : 'border-amber-300 bg-white'}`}>
                {clientData.hasEcp && (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm sm:text-base font-semibold leading-snug block ${clientData.hasEcp ? 'text-green-800' : 'text-amber-800'}`}>
                  {clientData.hasEcp ? '✅ У меня есть ЭЦП' : '🔑 У меня есть ЭЦП'}
                </span>
                <span className={`text-[11px] sm:text-xs leading-snug block mt-0.5 ${clientData.hasEcp ? 'text-green-600' : 'text-amber-600'}`}>
                  {clientData.hasEcp
                    ? 'Отлично! Электронная подпись на Рутокен / JaCarta'
                    : 'ЭЦП обязательна для маркировки. Менеджер подскажет, как её получить, когда перезвонит.'}
                </span>
              </div>
            </div>
            <Button
              className={`w-full py-4 sm:py-5 text-base sm:text-lg font-bold transition-all ${canSubmit ? 'bg-[#F59E0B] hover:bg-[#D97706] hover:shadow-lg hover:shadow-[#F59E0B]/20 text-white' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
              size="lg"
              disabled={!canSubmit}
              onClick={handleDone}
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Отправить заявку
            </Button>
            <p className="text-[10px] sm:text-xs text-slate-400 text-center mt-2">
              Нажимая кнопку, вы соглашаетесь с{' '}
              <a href="/privacy" target="_blank" className="text-[#163A5F] underline hover:text-[#1E4A78]">политикой конфиденциальности</a>
              {' '}и{' '}
              <a href="/oferta" target="_blank" className="text-[#163A5F] underline hover:text-[#1E4A78]">офертой</a>
            </p>
          </div>
        </Card>
        {kkmType === 'atol' && effectiveKkm !== 'sigma' && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-blue-800 text-xs">Согласие для партнёрского кабинета Атол</p>
                <p className="text-xs text-blue-600 mt-0.5">Для обслуживания кассы Атол нужно добавить её в наш партнёрский кабинет. Укажите код <strong>9331</strong> в заявлении.</p>
                <a href="/soglasiye-atol.pdf" download className="inline-flex items-center gap-2 mt-1.5 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Скачать согласие (PDF)
                </a>
              </div>
            </div>
          </div>
        )}
        <Button variant="outline" className="w-full text-xs" onClick={handleReset}>Сбросить всё</Button>
    </div>
  )
}
