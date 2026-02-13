import { Oval } from 'react-loader-spinner'
function BtnLoader({ height, width }) {
    return (
        <Oval
            visible={true}
            height={height ? height : 30}
            width={width ? width : 30}
            strokeWidth={5}
            strokeWidthSecondary={5}
            color="#fff"
            secondaryColor="#4fa94d"
            ariaLabel="oval-loading"
            wrapperStyle={{}}
            wrapperClass=""
        />
    )
}
export default BtnLoader