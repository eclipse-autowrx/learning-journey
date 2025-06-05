
export default function BtnFullRounded({ children, onClick, disable}) {
    return (
        <button
            className={`text-[12px] font-bold text-white 
                         w-fit select-none
                        ${disable?'btn-primary-disabled': 'btn-primary cursor-pointer hover:scale-110'}
                `
            }
            onClick={(e) => {
                if(!disable && onClick) {
                    onClick(e)
                }
            }}
        >
            {children}
        </button>
    );
}