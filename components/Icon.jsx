
import * as FeatherIcons from 'react-feather'

export default function Icon({ icon }){
    const IconComponent = FeatherIcons[icon]
    return <IconComponent />
}