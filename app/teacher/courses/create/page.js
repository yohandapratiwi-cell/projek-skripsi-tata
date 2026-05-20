"use client";

import { useState } from "react";
import StepCourse from "./components/StepCourse";
import StepModule from "./components/StepModule";
import StepMateri from "./components/StepMateri";

export default function CreateCoursePage() {
  const [step, setStep] = useState(1);
  const [courseId, setCourseId] = useState(null);
  const [modules, setModules] = useState([]);

  return (
    <div className="w-full mx-auto flex flex-col gap-6 bg-slate-900 p-8 rounded-3xl border border-slate-800">
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="text-2xl font-bold text-white">Tambah Course Baru</h1>
        <p className="text-sm text-slate-500">Lengkapi data di bawah ini sesuai urutan.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Step 1: Info Course */}
        <div className={step !== 1 ? 'hidden' : 'block'}>
          <StepCourse setStep={setStep} setCourseId={setCourseId} />
        </div>

        {/* Step 2: Modul */}
        <div className={step !== 2 ? 'hidden' : 'block'}>
          <StepModule 
            courseId={courseId} 
            setStep={setStep} 
            modules={modules} 
            setModules={setModules} 
          />
        </div>

        {/* Step 3: Materi */}
        <div className={step !== 3 ? 'hidden' : 'block'}>
          <StepMateri modules={modules} />
        </div>
      </div>
    </div>
  );
}