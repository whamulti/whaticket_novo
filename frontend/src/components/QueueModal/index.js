import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import ColorPicker from "../ColorPicker";
import { IconButton, InputAdornment } from "@material-ui/core";
import { Colorize } from "@material-ui/icons";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		marginRight: theme.spacing(1),
		flex: 1,
	},

	btnWrapper: {
		position: "relative",
	},

	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
	},
	colorAdorment: {
		width: 20,
		height: 20,
	},
	weekDaysContainer: {
		marginTop: theme.spacing(2),
		marginBottom: theme.spacing(2),
	},
}));

const QueueSchema = Yup.object().shape({
	name: Yup.string()
		.min(2, "Too Short!")
		.max(50, "Too Long!")
		.required("Required"),
	color: Yup.string().min(3, "Too Short!").max(9, "Too Long!").required(),
	greetingMessage: Yup.string(),
	startWork: Yup.string(),
	endWork: Yup.string(),
	absenceMessage: Yup.string(),
});

const QueueModal = ({ open, onClose, queueId }) => {
	const classes = useStyles();

	const initialState = {
		name: "",
		color: "",
		greetingMessage: "",
		startWork: "",
		endWork: "",
		absenceMessage: "",
		workDays: {
			"0": false, // Domingo
			"1": false, // Segunda
			"2": false, // Terça
			"3": false, // Quarta
			"4": false, // Quinta
			"5": false, // Sexta
			"6": false, // Sábado
		},
	};

	const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
	const [queue, setQueue] = useState(initialState);
	const greetingRef = useRef();

	const weekDays = [
		{ key: "1", label: i18n.t("queueModal.form.monday") },
		{ key: "2", label: i18n.t("queueModal.form.tuesday") },
		{ key: "3", label: i18n.t("queueModal.form.wednesday") },
		{ key: "4", label: i18n.t("queueModal.form.thursday") },
		{ key: "5", label: i18n.t("queueModal.form.friday") },
		{ key: "6", label: i18n.t("queueModal.form.saturday") },
		{ key: "0", label: i18n.t("queueModal.form.sunday") },
	];

useEffect(() => {
  (async () => {
    if (!queueId) return;
    try {
      const { data } = await api.get(`/queue/${queueId}`);
      
      // Parse workDays se vier como string
      let parsedWorkDays;
      if (typeof data.workDays === 'string') {
        parsedWorkDays = JSON.parse(data.workDays);
      } else {
        parsedWorkDays = data.workDays;
      }
      
      const finalWorkDays = parsedWorkDays || {
        "0": false,
        "1": false,
        "2": false,
        "3": false,
        "4": false,
        "5": false,
        "6": false,
      };
      
      setQueue(prevState => {
        return { 
          ...prevState, 
          ...data,
          workDays: finalWorkDays
        };
      });
    } catch (err) {
      toastError(err);
    }
  })();

  return () => {
    setQueue({
      name: "",
      color: "",
      greetingMessage: "",
      startWork: "",
      endWork: "",
      absenceMessage: "",
      workDays: {
        "0": false,
        "1": false,
        "2": false,
        "3": false,
        "4": false,
        "5": false,
        "6": false,
      },
    });
  };
}, [queueId, open]);

	const handleClose = () => {
		onClose();
		setQueue(initialState);
	};

const handleSaveQueue = async values => {
  try {
    console.log("🔍 VALUES recebidos:", values);
    console.log("🔍 values.workDays:", values.workDays);
    
    // Garante que workDays seja um objeto, não um array
    const workDaysObj = {
      "0": values.workDays?.["0"] === true,
      "1": values.workDays?.["1"] === true,
      "2": values.workDays?.["2"] === true,
      "3": values.workDays?.["3"] === true,
      "4": values.workDays?.["4"] === true,
      "5": values.workDays?.["5"] === true,
      "6": values.workDays?.["6"] === true,
    };

    console.log("🔍 workDaysObj montado:", workDaysObj);

    // Verifica se algum dia foi marcado
    const hasAnyDayMarked = Object.values(workDaysObj).some(day => day === true);
    
    console.log("🔍 hasAnyDayMarked:", hasAnyDayMarked);

    const dataToSave = {
      ...values,
      workDays: hasAnyDayMarked ? workDaysObj : null
    };

    console.log("🔍 dataToSave completo:", JSON.stringify(dataToSave));

    if (queueId) {
      await api.put(`/queue/${queueId}`, dataToSave);
    } else {
      await api.post("/queue", dataToSave);
    }
    toast.success("Queue saved successfully");
    handleClose();
  } catch (err) {
    toastError(err);
  }
};

	return (
		<div className={classes.root}>
			<Dialog open={open} onClose={handleClose} scroll="paper">
				<DialogTitle>
					{queueId
						? `${i18n.t("queueModal.title.edit")}`
						: `${i18n.t("queueModal.title.add")}`}
				</DialogTitle>
				<Formik
					initialValues={queue}
					enableReinitialize={true}
					validationSchema={QueueSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveQueue(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ touched, errors, isSubmitting, values, setFieldValue }) => (
						<Form>
							<DialogContent dividers>
								<Field
									as={TextField}
									label={i18n.t("queueModal.form.name")}
									autoFocus
									name="name"
									error={touched.name && Boolean(errors.name)}
									helperText={touched.name && errors.name}
									variant="outlined"
									margin="dense"
									className={classes.textField}
								/>
								<Field
									as={TextField}
									label={i18n.t("queueModal.form.color")}
									name="color"
									id="color"
									onFocus={() => {
										setColorPickerModalOpen(true);
										greetingRef.current.focus();
									}}
									error={touched.color && Boolean(errors.color)}
									helperText={touched.color && errors.color}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<div
													style={{ backgroundColor: values.color }}
													className={classes.colorAdorment}
												></div>
											</InputAdornment>
										),
										endAdornment: (
											<IconButton
												size="small"
												color="default"
												onClick={() => setColorPickerModalOpen(true)}
											>
												<Colorize />
											</IconButton>
										),
									}}
									variant="outlined"
									margin="dense"
								/>
								<ColorPicker
									open={colorPickerModalOpen}
									handleClose={() => setColorPickerModalOpen(false)}
									onChange={color => {
										values.color = color;
										setQueue(() => {
											return { ...values, color };
										});
									}}
								/>
								<div>
									<Field
										as={TextField}
										label={i18n.t("queueModal.form.greetingMessage")}
										type="greetingMessage"
										multiline
										inputRef={greetingRef}
										rows={5}
										fullWidth
										name="greetingMessage"
										error={
											touched.greetingMessage && Boolean(errors.greetingMessage)
										}
										helperText={
											touched.greetingMessage && errors.greetingMessage
										}
										variant="outlined"
										margin="dense"
									/>
								</div>
								<Field
									as={TextField}
									label={i18n.t("queueModal.form.startWork")}
									type="time"
									name="startWork"
									InputLabelProps={{
										shrink: true,
									}}
									inputProps={{
										step: 600, // 10 min
									}}
									error={touched.startWork && Boolean(errors.startWork)}
									helperText={touched.startWork && errors.startWork}
									variant="outlined"
									margin="dense"
									className={classes.textField}
								/>
								<Field
									as={TextField}
									label={i18n.t("queueModal.form.endWork")}
									type="time"
									name="endWork"
									InputLabelProps={{
										shrink: true,
									}}
									inputProps={{
										step: 600, // 10 min
									}}
									error={touched.endWork && Boolean(errors.endWork)}
									helperText={touched.endWork && errors.endWork}
									variant="outlined"
									margin="dense"
									className={classes.textField}
								/>
								
								<Box className={classes.weekDaysContainer}>
									<Typography variant="subtitle2" gutterBottom>
										{i18n.t("queueModal.form.weekDays")}
									</Typography>
									<Box display="flex" flexWrap="wrap">
										{weekDays.map(day => (
											<FormControlLabel
												key={day.key}
												control={
													<Checkbox
														checked={values.workDays?.[day.key] === true}
														onChange={(e) => {
															const newWorkDays = { 
																...values.workDays,
																[day.key]: e.target.checked 
															};
															setFieldValue('workDays', newWorkDays);
														}}
														name={`workDays.${day.key}`}
														color="primary"
													/>
												}
												label={day.label}
											/>
										))}
									</Box>
								</Box>

								<div>
									<Field
										as={TextField}
										label={i18n.t("queueModal.form.absenceMessage")}
										type="absenceMessage"
										multiline
										rows={2}
										fullWidth
										name="absenceMessage"
										error={
											touched.absenceMessage && Boolean(errors.absenceMessage)
										}
										helperText={
											touched.absenceMessage && errors.absenceMessage
										}
										variant="outlined"
										margin="dense"
									/>
								</div>
							</DialogContent>
							<DialogActions>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
								>
									{i18n.t("queueModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={classes.btnWrapper}
								>
									{queueId
										? `${i18n.t("queueModal.buttons.okEdit")}`
										: `${i18n.t("queueModal.buttons.okAdd")}`}
									{isSubmitting && (
										<CircularProgress
											size={24}
											className={classes.buttonProgress}
										/>
									)}
								</Button>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</div>
	);
};

export default QueueModal;