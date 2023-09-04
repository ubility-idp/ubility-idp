"use client";
import ScrollToTopButton from "@/components/Elements/ScrollToTopButton";
import HorizontalLinearStepper from "@/components/HorizontalLinearStepper";
import StepsContainer from "@/components/StepsContainer";

export default function Home() {
  return (
    <div className="relative">
      <StepsContainer>
        <HorizontalLinearStepper />
      </StepsContainer>
      <ScrollToTopButton />
    </div>
  );
}
