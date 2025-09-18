export interface ButtonProps extends React.PropsWithChildren {};

const Button = ({ children }: ButtonProps) => {
    return (
        <button>{children}</button>
    );
};
export default Button;
