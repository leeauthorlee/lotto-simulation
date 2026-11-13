"use client";

import { useEffect, useRef, useState } from "react";

const COMBINATIONS = 8_145_060;
const TICKET_PRICE = 1_000;
const BATCH_SIZE = 1_200;
const MAX_WEEKS = 10_000_000;
const ticketOptions = [10, 50, 100, 200, 500];

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}

function formatMoney(value: number) {
  if (value >= 100_000_000) return `${(value / 100_000_000).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}억 원`;
  if (value >= 10_000_000) return `${(value / 10_000_000).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}천만 원`;
  return `${formatNumber(value)}원`;
}

function SparkleIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Z"/><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/></svg>;
}

function PlayIcon({ paused = false }: { paused?: boolean }) {
  return paused
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7L8 5Z" /></svg>
    : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h3v14H8zM15 5h3v14h-3z" /></svg>;
}

function RefreshIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.1 9a6.5 6.5 0 0 1 11-2L20 12M4 12l2.9 5a6.5 6.5 0 0 0 11-2"/></svg>;
}

export default function Home() {
  const [tickets, setTickets] = useState(100);
  const [weeks, setWeeks] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);
  const [lastBatch, setLastBatch] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startTime = useRef<number | null>(null);
  const probability = Math.min(tickets / COMBINATIONS, 1);
  const chance = 1 - Math.pow(1 - probability, weeks);
  const expectedWeeks = Math.ceil(1 / probability);
  const totalSpend = weeks * tickets * TICKET_PRICE;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      let count = 0;
      let found = false;
      while (count < BATCH_SIZE && weeks + count < MAX_WEEKS) {
        count += 1;
        if (Math.random() < probability) {
          found = true;
          break;
        }
      }
      setWeeks((current) => current + count);
      setLastBatch(count);
      if (startTime.current) setElapsed((Date.now() - startTime.current) / 1000);
      if (found || weeks + count >= MAX_WEEKS) {
        setWon(found);
        setRunning(false);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [running, probability, weeks]);

  function startSimulation() {
    if (won) resetSimulation();
    startTime.current = Date.now() - elapsed * 1000;
    setRunning(true);
  }

  function resetSimulation() {
    setRunning(false);
    setWon(false);
    setWeeks(0);
    setLastBatch(0);
    setElapsed(0);
    startTime.current = null;
  }

  const progress = Math.min(chance * 100, 99.9);
  const etaYears = expectedWeeks / 52;
  const timeLabel = elapsed < 60
    ? `${elapsed.toFixed(1)}초`
    : `${Math.floor(elapsed / 60)}분 ${Math.floor(elapsed % 60)}초`;

  return (
    <main className="page-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Lotto Lab 홈">
          <span className="brand-mark"><SparkleIcon /></span>
          <span>lotto<span className="brand-light">lab</span></span>
        </a>
        <div className="topbar-note"><span className="live-dot" /> 확률로 알아보는 로또의 모든 것</div>
        <a className="about-link" href="#about">시뮬레이션 안내 <span>↗</span></a>
      </header>

      <section className="hero" id="top">
        <div className="eyebrow"><span className="eyebrow-icon"><SparkleIcon /></span> LOTTO 6/45 · 확률 시뮬레이터</div>
        <h1>1등, 도대체<br className="mobile-break" /> <span>몇 주</span>나 걸릴까?</h1>
        <p className="hero-copy">매주 꾸준히 로또를 산다면, 1등에 당첨되기까지<br className="desktop-break" /> 얼마나 걸릴지 직접 확인해 보세요.</p>
      </section>

      <section className="simulator-card" aria-label="로또 시뮬레이션">
        <div className="card-heading">
          <div>
            <span className="section-kicker">YOUR SCENARIO</span>
            <h2>나의 구매 시나리오</h2>
          </div>
          <div className="round-badge"><span className="live-dot" /> 매주 추첨</div>
        </div>

        <div className="ticket-selector">
          <div className="selector-label"><span>매주 구매할 복권</span><span className="selected-amount">{formatNumber(tickets)}<small>장</small></span></div>
          <div className="option-row" role="group" aria-label="매주 구매할 복권 수">
            {ticketOptions.map((amount) => (
              <button key={amount} className={`option-button ${tickets === amount ? "selected" : ""}`} onClick={() => { setTickets(amount); resetSimulation(); }} disabled={running} aria-pressed={tickets === amount}>
                {amount}<span>장</span>
              </button>
            ))}
          </div>
          <div className="selector-foot"><span>한 장당 1,000원</span><span>주 {formatNumber(tickets * TICKET_PRICE)}원</span></div>
        </div>

        <div className="simulation-controls">
          <button className="run-button" onClick={running ? () => setRunning(false) : startSimulation}>
            <PlayIcon paused={running} />
            {won ? "다시 시뮬레이션" : running ? "잠시 멈추기" : weeks > 0 ? "계속하기" : "시뮬레이션 시작"}
          </button>
          <button className="reset-button" onClick={resetSimulation} aria-label="초기화" title="초기화"><RefreshIcon /></button>
        </div>
        <div className="speed-note"><span className="speed-pulse" /> 0.1초마다 최대 1,200주 진행 · 실제 확률 기반</div>

        <div className={`result-panel ${won ? "is-won" : ""}`} aria-live="polite">
          <div className="result-topline">
            <span className="result-label">{won ? "당첨까지 걸린 시간" : running ? "시뮬레이션 진행 중" : "시뮬레이션 결과"}</span>
            <span className={`status-pill ${running ? "status-running" : won ? "status-won" : ""}`}><span />{won ? "1등 당첨" : running ? "RUNNING" : weeks ? "PAUSED" : "READY"}</span>
          </div>
          <div className="main-result"><strong>{formatNumber(weeks)}</strong><span>주</span><span className="result-caption">{won ? `약 ${(weeks / 52).toLocaleString("ko-KR", { maximumFractionDigits: 1 })}년 만에 행운이 찾아왔어요!` : "당첨될 때까지 매주 구매한다고 가정해요"}</span></div>
          <div className="progress-area">
            <div className="progress-label"><span>누적 당첨 확률</span><strong>{(chance * 100).toLocaleString("ko-KR", { maximumFractionDigits: 4 })}%</strong></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
            <div className="progress-foot"><span>0%</span><span>{won ? `당첨 확인 · ${formatNumber(weeks)}주 진행` : running ? `이번에 ${formatNumber(lastBatch)}주 진행` : weeks ? "시뮬레이션이 일시 정지됐어요" : "시뮬레이션을 시작해 보세요"}</span><span>100%</span></div>
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card"><span className="stat-icon purple-icon">◷</span><span className="stat-label">기대 대기 기간</span><strong>{formatNumber(expectedWeeks)}<small>주</small></strong><span className="stat-foot">약 {formatNumber(Math.ceil(etaYears))}년</span></div>
          <div className="stat-card"><span className="stat-icon blue-icon">₩</span><span className="stat-label">지금까지 구매 비용</span><strong className="money-value">{formatMoney(totalSpend)}</strong><span className="stat-foot">{formatNumber(weeks * tickets)}장 구매</span></div>
          <div className="stat-card"><span className="stat-icon mint-icon">↗</span><span className="stat-label">시뮬레이션 시간</span><strong>{timeLabel}</strong><span className="stat-foot">0.1초 단위로 진행</span></div>
        </div>

        <div className="fine-print"><span className="info-icon">i</span><span>매주 구매하는 복권의 번호 조합은 서로 다르다고 가정합니다. 실제 당첨 결과를 예측하거나 보장하지 않으며, 모든 회차는 독립적인 확률로 계산돼요.</span></div>
      </section>

      <section className="odds-section" id="about">
        <div className="odds-copy"><span className="section-kicker">THE ODDS</span><h2>숫자로 보는<br />로또 1등 확률</h2><p>6개 번호를 모두 맞힐 확률은<br />단 한 장으로 약 814만 분의 1.</p></div>
        <div className="odds-card"><div className="odds-card-top"><span>로또 6/45 1등 당첨 확률</span><span className="tiny-tag">1 TICKET</span></div><div className="odds-number">1<span>/</span>8,145,060</div><div className="odds-divider"/><div className="odds-bottom"><span>매주 {formatNumber(tickets)}장 구매 시</span><strong>주간 확률 <b>{(probability * 100).toFixed(5)}%</b></strong></div></div>
      </section>

      <footer className="footer"><span>© 2026 LOTTO LAB</span><span>재미로 보는 확률 시뮬레이션 <span className="footer-heart">♥</span></span><a href="#top">맨 위로 ↑</a></footer>
    </main>
  );
}
