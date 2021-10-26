import Select from '/components/Select'

export default function TransferStep(props) {
	return (
		<div className="w-full text-center mt-8 mb-4 pb-2 font-bold">
			<div className="mb-2">Transfer Style</div>
			<div className="">
				<div className="w-full">
					<Select
						label="Style Model"
						options={props.styleModelOptions}
						value={props.selectedStyleNet}
						onChange={props.setSelectedStyleNet}
					/>
				</div>
				<div className="mt-4 w-full">
					<Select
						label="Transformer Model"
						options={props.transformModelOptions}
						value={props.selectedTransformNet}
						onChange={props.setSelectedTransformNet}
					/>
				</div>
			</div>
			<canvas className="mt-4 max-w-screen-sm" ref={props.stylizedRef} width="100"></canvas>

		</div>
	);
}
