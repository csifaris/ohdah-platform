import ohdahLogo from '../../assets/ohdah-logo.png';

export function AuthBrand() {
  return (
    <div className="flex justify-center items-center py-2">
      <img
        alt="Ohdah Logo"
        className="h-auto w-[130px] sm:w-[145px] object-contain select-none"
        draggable={false}
        src={ohdahLogo}
      />
    </div>
  );
}
