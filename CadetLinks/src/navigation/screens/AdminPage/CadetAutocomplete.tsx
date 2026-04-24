import React, { useEffect, useRef, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { generalStyles as styles } from "../../../styles/GeneralStyles";

type Props = {
	value: string;
	cadetNames: string[];
	onSelect: (name: string) => void;
	onClear: () => void;
};

export function CadetAutocomplete({ value, cadetNames, onSelect, onClear }: Props) {
	const [text, setText] = useState(value);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const isFocused = useRef(false);
	const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		if (!isFocused.current) {
			setText(value);
		}
	}, [value]);

	useEffect(() => {
		return () => {
			if (blurTimer.current != null) clearTimeout(blurTimer.current);
		};
	}, []);

	const suggestions =
		showSuggestions && text.trim()
			? cadetNames
					.filter((n) => n.toLowerCase().includes(text.toLowerCase()))
					.slice(0, 8)
			: [];

	const handleFocus = () => {
		if (blurTimer.current != null) clearTimeout(blurTimer.current);
		isFocused.current = true;
		setShowSuggestions(true);
	};

	const handleBlur = () => {
		blurTimer.current = setTimeout(() => {
			isFocused.current = false;
			setShowSuggestions(false);
			if (!cadetNames.includes(text)) {
				if (text.trim() === "") {
					onClear();
				} else {
					setText(value);
				}
			}
		}, 150);
	};

	const handleSelect = (name: string) => {
		if (blurTimer.current != null) clearTimeout(blurTimer.current);
		setText(name);
		setShowSuggestions(false);
		isFocused.current = false;
		onSelect(name);
	};

	return (
		<View style={styles.adminAutocompleteWrapper}>
			<TextInput
				value={text}
				onChangeText={(t) => {
					setText(t);
					setShowSuggestions(true);
				}}
				onFocus={handleFocus}
				onBlur={handleBlur}
				style={styles.adminCadetInput}
				placeholder="Search cadet…"
				placeholderTextColor="#7C8699"
			/>
			{suggestions.length > 0 && (
				<View style={styles.adminSuggestionList}>
					{suggestions.map((name) => (
						<Pressable
							key={name}
							onPress={() => handleSelect(name)}
							style={styles.adminSuggestionItem}
						>
							<Text style={styles.adminSuggestionText}>{name}</Text>
						</Pressable>
					))}
				</View>
			)}
		</View>
	);
}
