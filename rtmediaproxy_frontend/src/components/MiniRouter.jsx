// client side mini router
export default function MiniRouter(props) {
    if(props.strict){
        return (location.pathname === props.path || location.pathname === props.path + "/") ? props.children : <></>;
    }else{
        return (location.pathname.startsWith(props.path))? props.children : <></>;
    }
}