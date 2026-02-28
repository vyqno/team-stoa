import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Sparkles, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useAuth } from "@/hooks/use-auth";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { thirdwebClient, CHAIN } from "@/lib/thirdweb";
import { wallet as walletApi } from "@/lib/api";
import { toast } from "sonner";

// Shared mouse position context via ref (avoids 3 separate listeners)
interface MousePos {
  x: number;
  y: number;
}

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
  mousePos: MousePos;
}

const Pupil = ({
  size = 12,
  maxDistance = 5,
  pupilColor = "black",
  forceLookX,
  forceLookY,
  mousePos,
}: PupilProps) => {
  const pupilRef = useRef<HTMLDivElement>(null);

  const pupilPosition = useMemo(() => {
    if (!pupilRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }
    const pupil = pupilRef.current.getBoundingClientRect();
    const centerX = pupil.left + pupil.width / 2;
    const centerY = pupil.top + pupil.height / 2;
    const deltaX = mousePos.x - centerX;
    const deltaY = mousePos.y - centerY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  }, [mousePos.x, mousePos.y, forceLookX, forceLookY, maxDistance]);

  return (
    <div
      ref={pupilRef}
      className="rounded-full"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: pupilColor,
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: "transform 0.1s ease-out",
      }}
    />
  );
};

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
  mousePos: MousePos;
}

const EyeBall = ({
  size = 48,
  pupilSize = 16,
  maxDistance = 10,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY,
  mousePos,
}: EyeBallProps) => {
  const eyeRef = useRef<HTMLDivElement>(null);

  const pupilPosition = useMemo(() => {
    if (!eyeRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }
    const eye = eyeRef.current.getBoundingClientRect();
    const centerX = eye.left + eye.width / 2;
    const centerY = eye.top + eye.height / 2;
    const deltaX = mousePos.x - centerX;
    const deltaY = mousePos.y - centerY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);
    const angle = Math.atan2(deltaY, deltaX);
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  }, [mousePos.x, mousePos.y, forceLookX, forceLookY, maxDistance]);

  return (
    <div
      ref={eyeRef}
      className="rounded-full flex items-center justify-center transition-all duration-150"
      style={{
        width: `${size}px`,
        height: isBlinking ? "2px" : `${size}px`,
        backgroundColor: eyeColor,
        overflow: "hidden",
      }}
    >
      {!isBlinking && (
        <div
          className="rounded-full"
          style={{
            width: `${pupilSize}px`,
            height: `${pupilSize}px`,
            backgroundColor: pupilColor,
            transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
            transition: "transform 0.1s ease-out",
          }}
        />
      )}
    </div>
  );
};

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mousePos, setMousePos] = useState<MousePos>({ x: 0, y: 0 });
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);
  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { login: authLogin, user, setUser } = useAuth();
  const navigate = useNavigate();
  const account = useActiveAccount();
  const linkingRef = useRef(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  // Link thirdweb wallet to Stoa account when connected
  useEffect(() => {
    if (!account?.address || !user || linkingRef.current) return;
    if (user.walletAddress === account.address) return;
    linkingRef.current = true;
    walletApi
      .link(account.address)
      .then(() => {
        setUser({ ...user, walletAddress: account.address });
        toast.success("Wallet linked!");
      })
      .catch((err: Error) => toast.error(err.message || "Failed to link wallet"))
      .finally(() => { linkingRef.current = false; });
  }, [account?.address, user]);

  // Single consolidated mousemove listener with throttle
  useEffect(() => {
    if (prefersReducedMotion) return;
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setMousePos({ x: e.clientX, y: e.clientY });
      });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  // Blinking effects consolidated
  useEffect(() => {
    if (prefersReducedMotion) return;
    let purpleTimeout: ReturnType<typeof setTimeout>;
    let blackTimeout: ReturnType<typeof setTimeout>;
    let purpleInner: ReturnType<typeof setTimeout>;
    let blackInner: ReturnType<typeof setTimeout>;

    const schedulePurpleBlink = () => {
      purpleTimeout = setTimeout(() => {
        setIsPurpleBlinking(true);
        purpleInner = setTimeout(() => {
          setIsPurpleBlinking(false);
          schedulePurpleBlink();
        }, 150);
      }, Math.random() * 4000 + 3000);
    };

    const scheduleBlackBlink = () => {
      blackTimeout = setTimeout(() => {
        setIsBlackBlinking(true);
        blackInner = setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlackBlink();
        }, 150);
      }, Math.random() * 4000 + 3000);
    };

    schedulePurpleBlink();
    scheduleBlackBlink();

    return () => {
      clearTimeout(purpleTimeout);
      clearTimeout(blackTimeout);
      clearTimeout(purpleInner);
      clearTimeout(blackInner);
    };
  }, [prefersReducedMotion]);

  // Looking at each other when typing
  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => setIsLookingAtEachOther(false), 800);
      return () => clearTimeout(timer);
    }
    setIsLookingAtEachOther(false);
  }, [isTyping]);

  // Purple peeking
  useEffect(() => {
    if (password.length > 0 && showPassword && !prefersReducedMotion) {
      const peekInterval = setTimeout(() => {
        setIsPurplePeeking(true);
        setTimeout(() => setIsPurplePeeking(false), 800);
      }, Math.random() * 3000 + 2000);
      return () => clearTimeout(peekInterval);
    }
    setIsPurplePeeking(false);
  }, [password, showPassword, isPurplePeeking, prefersReducedMotion]);

  const calculatePosition = useCallback(
    (ref: React.RefObject<HTMLDivElement | null>) => {
      if (!ref.current || prefersReducedMotion) return { faceX: 0, faceY: 0, bodySkew: 0 };
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 3;
      const deltaX = mousePos.x - centerX;
      const deltaY = mousePos.y - centerY;
      const faceX = Math.max(-15, Math.min(15, deltaX / 20));
      const faceY = Math.max(-10, Math.min(10, deltaY / 30));
      const bodySkew = Math.max(-6, Math.min(6, -deltaX / 120));
      return { faceX, faceY, bodySkew };
    },
    [mousePos.x, mousePos.y, prefersReducedMotion]
  );

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!password || password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await authLogin(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Content Section */}
      <div className="relative hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-12 text-primary-foreground">
        <div className="relative z-20 flex items-end justify-center h-[500px] mt-8" aria-hidden="true">
          {/* Cartoon Characters */}
          <div className="relative w-full max-w-[550px] h-[400px]">
            {/* Purple tall rectangle character */}
            <div
              ref={purpleRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "12%",
                width: "32%",
                height: isTyping || (password.length > 0 && !showPassword) ? "440px" : "400px",
                backgroundColor: "hsl(var(--celery-dark))",
                borderRadius: "10px 10px 0 0",
                zIndex: 1,
                transform:
                  password.length > 0 && showPassword
                    ? "skewX(0deg)"
                    : isTyping || (password.length > 0 && !showPassword)
                      ? `skewX(${(purplePos.bodySkew || 0) - 12}deg) translateX(40px)`
                      : `skewX(${purplePos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-700 ease-in-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? "20px"
                      : isLookingAtEachOther
                        ? "55px"
                        : `${45 + purplePos.faceX}px`,
                  top:
                    password.length > 0 && showPassword
                      ? "35px"
                      : isLookingAtEachOther
                        ? "65px"
                        : `${40 + purplePos.faceY}px`,
                }}
              >
                <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="hsl(var(--ink))" isBlinking={isPurpleBlinking} mousePos={mousePos} forceLookX={password.length > 0 && showPassword ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined} forceLookY={password.length > 0 && showPassword ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
                <EyeBall size={18} pupilSize={7} maxDistance={5} eyeColor="white" pupilColor="hsl(var(--ink))" isBlinking={isPurpleBlinking} mousePos={mousePos} forceLookX={password.length > 0 && showPassword ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined} forceLookY={password.length > 0 && showPassword ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined} />
              </div>
            </div>

            {/* Black tall rectangle character */}
            <div
              ref={blackRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "43%",
                width: "22%",
                height: "310px",
                backgroundColor: "hsl(var(--ink))",
                borderRadius: "8px 8px 0 0",
                zIndex: 2,
                transform:
                  password.length > 0 && showPassword
                    ? "skewX(0deg)"
                    : isLookingAtEachOther
                      ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 10}deg) translateX(20px)`
                      : isTyping || (password.length > 0 && !showPassword)
                        ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                        : `skewX(${blackPos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-700 ease-in-out"
                style={{
                  left:
                    password.length > 0 && showPassword
                      ? "10px"
                      : isLookingAtEachOther
                        ? "32px"
                        : `${26 + blackPos.faceX}px`,
                  top:
                    password.length > 0 && showPassword
                      ? "28px"
                      : isLookingAtEachOther
                        ? "12px"
                        : `${32 + blackPos.faceY}px`,
                }}
              >
                <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="hsl(var(--ink))" isBlinking={isBlackBlinking} mousePos={mousePos} forceLookX={password.length > 0 && showPassword ? -4 : isLookingAtEachOther ? 0 : undefined} forceLookY={password.length > 0 && showPassword ? -4 : isLookingAtEachOther ? -4 : undefined} />
                <EyeBall size={16} pupilSize={6} maxDistance={4} eyeColor="white" pupilColor="hsl(var(--ink))" isBlinking={isBlackBlinking} mousePos={mousePos} forceLookX={password.length > 0 && showPassword ? -4 : isLookingAtEachOther ? 0 : undefined} forceLookY={password.length > 0 && showPassword ? -4 : isLookingAtEachOther ? -4 : undefined} />
              </div>
            </div>

            {/* Orange semi-circle character */}
            <div
              ref={orangeRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "0%",
                width: "43%",
                height: "200px",
                zIndex: 3,
                backgroundColor: "hsl(var(--warning))",
                borderRadius: "120px 120px 0 0",
                transform: password.length > 0 && showPassword ? "skewX(0deg)" : `skewX(${orangePos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-8 transition-all duration-200 ease-out"
                style={{
                  left: password.length > 0 && showPassword ? "50px" : `${82 + (orangePos.faceX || 0)}px`,
                  top: password.length > 0 && showPassword ? "85px" : `${90 + (orangePos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="hsl(var(--ink))" mousePos={mousePos} forceLookX={password.length > 0 && showPassword ? -5 : undefined} forceLookY={password.length > 0 && showPassword ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="hsl(var(--ink))" mousePos={mousePos} forceLookX={password.length > 0 && showPassword ? -5 : undefined} forceLookY={password.length > 0 && showPassword ? -4 : undefined} />
              </div>
            </div>

            {/* Yellow tall rectangle character */}
            <div
              ref={yellowRef}
              className="absolute bottom-0 transition-all duration-700 ease-in-out"
              style={{
                left: "56%",
                width: "25%",
                height: "230px",
                backgroundColor: "hsl(var(--celery-light))",
                borderRadius: "70px 70px 0 0",
                zIndex: 4,
                transform: password.length > 0 && showPassword ? "skewX(0deg)" : `skewX(${yellowPos.bodySkew || 0}deg)`,
                transformOrigin: "bottom center",
              }}
            >
              <div
                className="absolute flex gap-6 transition-all duration-200 ease-out"
                style={{
                  left: password.length > 0 && showPassword ? "20px" : `${52 + (yellowPos.faceX || 0)}px`,
                  top: password.length > 0 && showPassword ? "35px" : `${40 + (yellowPos.faceY || 0)}px`,
                }}
              >
                <Pupil size={12} maxDistance={5} pupilColor="hsl(var(--ink))" mousePos={mousePos} forceLookX={password.length > 0 && showPassword ? -5 : undefined} forceLookY={password.length > 0 && showPassword ? -4 : undefined} />
                <Pupil size={12} maxDistance={5} pupilColor="hsl(var(--ink))" mousePos={mousePos} forceLookX={password.length > 0 && showPassword ? -5 : undefined} forceLookY={password.length > 0 && showPassword ? -4 : undefined} />
              </div>
              <div
                className="absolute w-20 h-[4px] rounded-full transition-all duration-200 ease-out"
                style={{
                  backgroundColor: "hsl(var(--ink))",
                  left: password.length > 0 && showPassword ? "10px" : `${40 + (yellowPos.faceX || 0)}px`,
                  top: password.length > 0 && showPassword ? "88px" : `${88 + (yellowPos.faceY || 0)}px`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="relative z-20 flex items-center gap-8 text-sm text-primary-foreground/60">
          <a href="/privacy" className="hover:text-primary-foreground transition-colors">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-primary-foreground transition-colors">
            Terms of Service
          </a>
          <a href="/contact" className="hover:text-primary-foreground transition-colors">
            Contact
          </a>
        </div>

        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" aria-hidden="true" />
        <div className="absolute top-1/4 right-1/4 size-64 bg-primary-foreground/10 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-1/4 left-1/4 size-96 bg-primary-foreground/5 rounded-full blur-3xl" aria-hidden="true" />
      </div>

      {/* Right Login Section */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[420px]">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-lg font-semibold mb-12">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="size-4 text-primary" aria-hidden="true" />
            </div>
            <span className="font-display font-bold">STOA</span>
          </div>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back!</h1>
            <p className="text-muted-foreground text-sm">Please enter your details</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5" aria-label="Login form">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="anna@gmail.com"
                value={email}
                autoComplete="off"
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                required
                aria-required="true"
                aria-describedby={error ? "login-error" : undefined}
                className="h-12 bg-background border-border/60 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-required="true"
                  aria-describedby={error ? "login-error" : undefined}
                  className="h-12 pr-10 bg-background border-border/60 focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff className="size-5" aria-hidden="true" />
                  ) : (
                    <Eye className="size-5" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Remember for 30 days
                </Label>
              </div>
              <a href="#" className="text-sm text-primary hover:underline font-medium">
                Forgot password?
              </a>
            </div>

            {error && (
              <div id="login-error" role="alert" className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              size="lg"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? "Signing in..." : "Log in"}
            </Button>
          </form>

          {/* Wallet Login */}
          <div className="mt-6">
            <div className="relative flex items-center justify-center mb-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/60" /></div>
              <span className="relative bg-background px-3 text-xs text-muted-foreground">or connect wallet</span>
            </div>
            <div className="flex justify-center [&_button]:!w-full [&_button]:!h-12">
              <ConnectButton
                client={thirdwebClient}
                chain={CHAIN}
                connectButton={{
                  label: "Connect Wallet",
                  className: "!w-full",
                }}
              />
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{" "}
            <a href="/connect/user" className="text-foreground font-medium hover:underline">
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export const Component = LoginPage;
export default LoginPage;
