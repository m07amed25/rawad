import { getTeacherSubjects } from "@/app/actions/subjects";
import SubjectsClient from "./SubjectsClient";

export default async function TeacherSubjectsSettingsPage() {
  const subjects = await getTeacherSubjects();

  return (
    <SubjectsClient
      initialSubjects={subjects.map((s) => ({
        id: s.id,
        name: s.name,
        academicYear: s.academicYear as
          | "الفرقة الأولى"
          | "الفرقة الثانية"
          | "الفرقة الثالثة"
          | "الفرقة الرابعة",
      }))}
    />
  );
}
