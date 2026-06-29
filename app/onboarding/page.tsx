"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/hooks/useLocale";
import { useAuth } from "@/lib/hooks/useAuth";
import { usePlayer } from "@/lib/hooks/usePlayer";
import { AVATAR_COLORS, SPORT_EMOJI, type SportType, type Gender, type AgeRange } from "@/lib/types";
import {
  normalizeGeorgianDigits,
  isValidGeorgianMobile,
  GEORGIA_DIAL_CODE,
} from "@/lib/phone";
import {
  signInWithPhone,
  registerWithPhone,
  signInWithEmail,
  registerWithEmail,
} from "@/lib/auth-client";
import { createOrUpdatePlayer } from "@/lib/api";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { LogoHorizontal } from "@/components/layout/Logo";
import { GenderPicker } from "@/components/profile/GenderPicker";
import { AgeRangePicker } from "@/components/profile/AgeRangePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const sports: SportType[] = ["football", "basketball", "volleyball"];

type AuthMethod = "phone" | "email";
type Step = "auth" | "profile";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function mapAuthError(code: string, t: ReturnType<typeof useT>, isPhone: boolean): string {
  if (code === "auth/email-already-in-use") {
    return isPhone ? t.onboarding.phoneInUse : t.onboarding.emailInUse;
  }
  if (
    code === "auth/invalid-credential" ||
    code === "auth/wrong-password" ||
    code === "auth/user-not-found"
  ) {
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
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [step, setStep] = useState<Step>("auth");
  const [digits, setDigits] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [selectedSports, setSelectedSports] = useState<SportType[]>([]);
  const [gender, setGender] = useState<Gender | null>(null);
  const [ageRange, setAgeRange] = useState<AgeRange | null>(null);
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

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(t.onboarding.passwordRequired);
      return;
    }

    if (authMethod === "phone") {
      const normalized = normalizeGeorgianDigits(digits);
      if (!isValidGeorgianMobile(normalized)) {
        setError(t.onboarding.invalidPhone);
        return;
      }

      setLoading(true);
      try {
        if (authMode === "signup") {
          await registerWithPhone(normalized, password);
        } else {
          await signInWithPhone(normalized, password);
        }
        // Profile step only if new user (useEffect redirects existing users to /)
      } catch (err: unknown) {
        const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
        setError(mapAuthError(code, t, true));
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!isValidEmail(email)) {
      setError(t.onboarding.invalidEmail);
      return;
    }

    setLoading(true);
    try {
      if (authMode === "signup") {
        await registerWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      // Profile step only if new user (useEffect redirects existing users to /)
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
      setError(mapAuthError(code, t, false));
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
    if (!gender) {
      setError(t.onboarding.genderRequired);
      return;
    }
    if (!ageRange) {
      setError(t.onboarding.ageRangeRequired);
      return;
    }

    setLoading(true);
    try {
      const created = await createOrUpdatePlayer({
        nickname: nickname.trim(),
        preferred_sports: selectedSports,
        avatar_color: color,
        gender,
        age_range: ageRange,
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
      : authMethod === "phone"
        ? t.onboarding.phoneSubtitle
        : authMode === "signup"
          ? t.onboarding.signUp
          : t.onboarding.signIn;

  return (
    <div className="relative flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="absolute right-4 top-4">
        <LanguageSwitcher />
      </div>

      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <LogoHorizontal priority />
        </div>
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

          <form onSubmit={handleAuth} className="space-y-4">
            {authMethod === "phone" ? (
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
            ) : (
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
            )}

            <div className="space-y-2">
              <Label htmlFor="password">{t.onboarding.passwordLabel}</Label>
              <Input
                id="password"
                type="password"
                autoComplete={authMode === "signup" ? "new-password" : "current-password"}
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
                : authMode === "signup"
                  ? t.onboarding.signUp
                  : t.onboarding.signIn}
            </Button>

            <button
              type="button"
              className="w-full text-center text-sm text-primary underline"
              onClick={() => {
                setAuthMode((m) => (m === "signin" ? "signup" : "signin"));
                resetAuthError();
              }}
            >
              {authMode === "signin" ? t.onboarding.switchToSignUp : t.onboarding.switchToSignIn}
            </button>
          </form>
        </>
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
            <Label>{t.onboarding.genderLabel}</Label>
            <GenderPicker value={gender} onChange={setGender} />
          </div>

          <div className="space-y-2">
            <Label>{t.onboarding.ageRangeLabel}</Label>
            <AgeRangePicker value={ageRange} onChange={setAgeRange} />
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
