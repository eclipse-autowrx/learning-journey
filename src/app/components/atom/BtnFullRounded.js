
export default function BtnFullRounded({ children, onClick, disable}) {
    return (
        <button
            className={`text-lg font-bold w-fit select-none px-6 py-2
                        ${disable?'btn-primary-disable': 'btn-primary cursor-pointer hover:scale-110'}
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