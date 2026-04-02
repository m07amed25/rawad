export function getErrorMessage(err: unknown): string {
  let message = "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً";

  if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === "string") {
    message = err;
  } else if (err && typeof err === "object" && "message" in err) {
    message = String((err as Record<string, unknown>).message);
  }

  const lowerMsg = message.toLowerCase();

  // Network & System Fallbacks
  if (
    lowerMsg.includes("fetch failed") ||
    lowerMsg.includes("network error") ||
    lowerMsg.includes("failed to fetch")
  ) {
    return "فشل في الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت";
  }
  if (lowerMsg.includes("timeout")) {
    return "انتهى وقت الطلب، يرجى المحاولة مرة أخرى";
  }
  if (
    lowerMsg.includes("rate limit") ||
    lowerMsg.includes("too many requests")
  ) {
    return "لقد تجاوزت الحد المسموح من الطلبات، يرجى الانتظار قليلاً";
  }
  if (
    lowerMsg.includes("server components render") ||
    lowerMsg.includes("omitted in production")
  ) {
    return "حدث خطأ داخلي في الخادم، يرجى تحديث الصفحة والمحاولة لاحقاً";
  }

  // Prisma / Database Errors
  if (lowerMsg.includes("unique constraint failed")) {
    if (lowerMsg.includes("nationalid")) {
      return "الرقم القومي مسجل بالفعل لحساب آخر";
    }
    if (lowerMsg.includes("email")) {
      return "البريد الإلكتروني مسجل بالفعل";
    }
    if (lowerMsg.includes("username")) {
      return "اسم المستخدم مسجل بالفعل";
    }
    return "البيانات المدخلة مسجلة بالفعل لحساب آخر";
  }
  if (
    lowerMsg.includes("record to update not found") ||
    lowerMsg.includes("p2025")
  ) {
    return "لم يتم العثور على السجل المطلوب تحديثه";
  }
  if (
    lowerMsg.includes("foreign key constraint") ||
    lowerMsg.includes("p2003")
  ) {
    return "لا يمكن تنفيذ العملية بسبب ارتباط البيانات بسجلات أخرى";
  }

  // Authentication Mappings
  if (
    lowerMsg.includes("invalid email or password") ||
    lowerMsg.includes("invalid credentials")
  ) {
    return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
  }
  if (
    lowerMsg.includes("user already exists") ||
    lowerMsg.includes("email already in use")
  ) {
    return "البريد الإلكتروني مسجل بالفعل";
  }
  if (lowerMsg.includes("user not found")) {
    return "لم يتم العثور على حساب مسجل بهذا البريد الإلكتروني";
  }
  if (
    lowerMsg.includes("invalid or expired otp") ||
    lowerMsg.includes("invalid otp")
  ) {
    return "رمز التحقق غير صحيح أو منتهي الصلاحية";
  }
  if (
    lowerMsg.includes("unauthorized") ||
    lowerMsg.includes("not authenticated")
  ) {
    return "إنتهت الجلسة أو غير مصرح لك، يرجى تسجيل الدخول مجدداً";
  }

  // If the message is empty or null somehow
  if (!message || message.trim() === "") {
    return "حدث خطأ غير متوقع، يرجى المحاولة لاحقاً";
  }

  return message;
}
