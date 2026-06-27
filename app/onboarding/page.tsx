"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/hooks/useLocale";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { AVATAR_COLORS, SPORT_EMOJI, type SportType } from "@/lib/types";
import {
  normalizeGeorgianDigits,
  isValidGeorgianMobile,
  GEORGIA_DIAL_CODE,
  formatDisplayPhone,
} from "@/lib/phone";
import {
  sendPhoneOtp,
  confirmPhoneOtp,
  signInWithEmail,
  registerWithEmail,
} from "@/lib/auth-client";
import { createOrUpdatePlayer } from "@/lib/api";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const sports: SportType[] = ["football", "basketball", "volleyball"];
const RECAPTCHA_ID = "recaptcha-container";

type AuthMethod = "phone" | "email";
type Step = "auth" | "otp" | "profile";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mapEmailError(code: string, t: ReturnType<typeof useT>): string {
  if (code === "auth/email-already-in-use") return t.onboarding.emailInUse;
  if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
    return t.onboarding.wrongCredentials;
  }
  return t.common.error;
}

export default function OnboardingPage() {
  const router = useRouter();
  const t = useT();
  const { user, loading: authLoading } = useAuth();
  const { player, setPlayer, loading: playerLoading } = usePlayer();

  const [authMethod, setAuthMethod] = useState<AuthMethod>("phone");
  const [emailMode, setEmailMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<Step>("auth");
  const [digits, setDigits] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [nickname, setNickname] = useState("");
  const [selectedSports, setSelectedSports] = useState<SportType[]>([]);
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading || playerLoading) return;
    if (user && player) {
      router.replace("/");
      return;
    }
    if (user && !player) {
      setStep("profile");
    }
  }, [user, player, authLoading, playerLoading, router]);

  function toggleSport(sport: SportType) {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  }

  function resetAuthError() {
    setError("");
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const normalized = normalizeGeorgianDigits(digits);
    if (!isValidGeorgianMobile(normalized)) {
      setError(t.onboarding.invalidPhone);
      return;
    }

    setLoading(true);
    try {
      await sendPhoneOtp(normalized, RECAPTCHA_ID);
      setStep("otp");
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.common.error;
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!isValidEmail(email)) {
      setError(t.onboarding.invalidEmail);
      return;
    }
    if (password.length < 6) {
      setError(t.onboarding.passwordRequired);
      return;
    }

    setLoading(true);
    try {
      if (emailMode === "signup") {
        await registerWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      setStep("profile");
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
      setError(mapEmailError(code, t));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (otp.trim().length < 6) {
      setError(t.onboarding.otpRequired);
      return;
    }

    setLoading(true);
    try {
      await confirmPhoneOtp(otp.trim());
      setStep("profile");
    } catch {
      setError(t.common.error);
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!nickname.trim()) {
      setError(t.onboarding.nicknameRequired);
      return;
    }
    if (selectedSports.length === 0) {
      setError(t.onboarding.sportsRequired);
      return;
    }

    setLoading(true);
    try {
      const created = await createOrUpdatePlayer({
        nickname: nickname.trim(),
        preferred_sports: selectedSports,
        avatar_color: color,
      });
      setPlayer(created);
      router.replace("/");
    } catch (err) {
      const msg = err instanceof Error ? err.message : t.common.error;
      setError(msg.includes("Firebase") || msg.includes("FIREBASE") ? t.common.firebaseNotConfigured : msg);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || playerLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        {t.common.loading}
      </div>
    );
  }

  const subtitle =
    step === "profile"
      ? t.onboarding.profileStep
      : step === "otp"
        ? `${GEORGIA_DIAL_CODE} ${formatDisplayPhone(digits)}`
        : authMethod === "phone"
          ? t.onboarding.phoneSubtitle
          : emailMode === "signup"
            ? t.onboarding.signUp
            : t.onboarding.signIn;

  return (
    <div className="relative flex min-h-dvh flex-col justify-center px-6 py-12">
      <div id={RECAPTCHA_ID} />
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">{t.appName}</h1>
        <p className="mt-2 text-muted-foreground">{subtitle}</p>
      </div>

      {step === "auth" && (
        <>
          <div className="mb-6 flex rounded-lg border bg-muted p-1">
            {(["phone", "email"] as const).map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => {
                  setAuthMethod(method);
                  resetAuthError();
                }}
                className={cn(
                  "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                  authMethod === method
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground"
                )}
              >
                {method === "phone" ? t.onboarding.authPhone : t.onboarding.authEmail}
              </button>
            ))}
          </div>

          {authMethod === "phone" ? (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="space-y-2">
                <Label>{t.onboarding.phoneTitle}</Label>
                <div className="flex gap-2">
                  <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm font-medium">
                    {GEORGIA_DIAL_CODE}
                  </div>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder="5XX XXX XXX"
                    value={digits}
                    onChange={(e) => setDigits(normalizeGeorgianDigits(e.target.value))}
                    maxLength={9}
                    autoFocus
                    className="flex-1"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? t.common.loading : t.onboarding.sendCode}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t.onboarding.emailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t.onboarding.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.onboarding.passwordLabel}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={emailMode === "signup" ? "new-password" : "current-password"}
                  placeholder={t.onboarding.passwordPlaceholder}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading
                  ? t.common.loading
                  : emailMode === "signup"
                    ? t.onboarding.signUp
                    : t.onboarding.signIn}
              </Button>
              <button
                type="button"
                className="w-full text-center text-sm text-primary underline"
                onClick={() => {
                  setEmailMode((m) => (m === "signin" ? "signup" : "signin"));
                  resetAuthError();
                }}
              >
                {emailMode === "signin" ? t.onboarding.switchToSignUp : t.onboarding.switchToSignIn}
              </button>
            </form>
          )}
        </>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="otp">{t.onboarding.otpLabel}</Label>
            <Input
              id="otp"
              inputMode="numeric"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              maxLength={6}
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? t.common.loading : t.onboarding.verify}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setStep("auth");
              setOtp("");
              setError("");
            }}
          >
            {t.onboarding.changePhone}
          </Button>
        </form>
      )}

      {step === "profile" && (
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nickname">{t.onboarding.nicknameLabel}</Label>
            <Input
              id="nickname"
              placeholder={t.onboarding.nicknamePlaceholder}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={24}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>{t.onboarding.sportsLabel}</Label>
            <div className="flex gap-3">
              {sports.map((sport) => (
                <button
                  key={sport}
                  type="button"
                  onClick={() => toggleSport(sport)}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-1 rounded-2xl border-2 py-4 transition-colors",
                    selectedSports.includes(sport)
                      ? "border-primary bg-primary/10"
                      : "border-muted"
                  )}
                >
                  <span className="text-2xl">{SPORT_EMOJI[sport]}</span>
                  <span className="text-xs font-medium">{t.sports[sport]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t.onboarding.colorLabel}</Label>
            <div className="flex flex-wrap gap-3">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-10 w-10 rounded-full transition-transform",
                    color === c && "ring-2 ring-offset-2 ring-foreground scale-110"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? t.common.loading : t.onboarding.submit}
          </Button>
        </form>
      )}
    </div>
  );
}
