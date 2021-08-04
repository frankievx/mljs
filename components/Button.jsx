export default function Button({ label, onClick }) {
    return <button 
        className="bg-primary text-black text-sm py-2 px-3 rounded-lg shadow-md w-full"
        onClick={onClick}
    >{label}</button>
}